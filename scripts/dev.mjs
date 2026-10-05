/**
 * npm run dev -- <fichero.ts>
 *
 * Comprueba los tipos y, solo si no hay errores, ejecuta el fichero.
 * Repite el ciclo cada vez que guardas cualquier .ts de src/:
 *
 *     guardar  ->  comprobar tipos  ->  si no hay errores, ejecutar
 *
 * Es el equivalente en modo vigilancia de `npm run play`
 * (que es simplemente `tsc --noEmit && tsx`).
 * Para vigilar sin comprobar tipos: `npm run dev:fast`.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, watch, writeFileSync, rmSync } from "node:fs";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = join(raiz, "node_modules", "typescript", "bin", "tsc");

// ---------- Fichero pedido en la línea de órdenes ----------
const [objetivo, ...resto] = process.argv.slice(2);

if (!objetivo) {
  console.error("Uso: npm run dev -- <fichero.ts>");
  console.error("Ejemplo: npm run dev -- src/05-arrays/demo.ts");
  process.exit(1);
}

const ficheroAbs = resolve(process.cwd(), objetivo);

if (!existsSync(ficheroAbs)) {
  console.error(`No existe el fichero: ${objetivo}`);
  process.exit(1);
}

// relative() empieza por ".." cuando el fichero queda fuera de src/
const fuera = relative(join(raiz, "src"), ficheroAbs).startsWith("..");

/** Lanza un proceso node y espera. Devuelve su código de salida. */
const ejecutar = (args) =>
  spawnSync(process.execPath, args, { stdio: "inherit", cwd: raiz }).status ?? 1;

/**
 * Comprueba los tipos. Devuelve 0 si todo está bien.
 *
 * `tsc` solo mira lo que lista el tsconfig.json ("include": ["src/**\/*.ts"]),
 * así que un fichero fuera de src/ necesita una pasada aparte, con la misma
 * configuración heredada vía "extends".
 */
function comprobarTipos() {
  const codigo = ejecutar([tsc, "--noEmit", "-p", join(raiz, "tsconfig.json")]);
  if (codigo !== 0 || !fuera) return codigo;

  const configTmp = join(tmpdir(), `tsconfig.dev.${process.pid}.json`);
  writeFileSync(
    configTmp,
    JSON.stringify({
      extends: join(raiz, "tsconfig.json"),
      compilerOptions: {
        noEmit: true,
        rootDir: raiz,
        // El config vive en el directorio temporal del sistema: hay que decirle
        // dónde están los @types del proyecto o no encontraría 'node'.
        typeRoots: [join(raiz, "node_modules", "@types")],
      },
      files: [ficheroAbs],
    }),
  );
  try {
    return ejecutar([tsc, "-p", configTmp]);
  } finally {
    rmSync(configTmp, { force: true });
  }
}

// ---------- Ciclo ----------
let hijo = null;
let temporizador = null;

function ciclo() {
  if (hijo) {
    hijo.kill("SIGTERM");
    hijo = null;
  }

  // Limpia la pantalla en cada ciclo, igual que hace `tsx watch` por defecto.
  // Así la consola solo muestra la salida de tsc o la del programa, sin
  // mensajes añadidos por este script.
  console.clear();

  if (comprobarTipos() !== 0) return; // tsc ya ha impreso los errores

  // `node --import tsx` en lugar del binario tsx: funciona igual en Windows.
  hijo = spawn(process.execPath, ["--import", "tsx", ficheroAbs, ...resto], {
    stdio: "inherit",
    cwd: raiz,
  });
  hijo.on("exit", () => {
    hijo = null;
  });
}

/** Agrupa las ráfagas de eventos: al guardar suelen llegar varios seguidos. */
function programar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(ciclo, 150);
}

const vigilantes = [
  watch(join(raiz, "src"), { recursive: true }, (_evento, fichero) => {
    if (fichero && fichero.endsWith(".ts")) programar();
  }),
];

if (fuera) vigilantes.push(watch(ficheroAbs, programar));

process.on("SIGINT", () => {
  if (hijo) hijo.kill("SIGTERM");
  for (const v of vigilantes) v.close();
  process.exit(0);
});

ciclo();
