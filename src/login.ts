// -----------------------------
// Feature: Login
// -----------------------------
interface Usuario {
    email: string;
    password: string;
}
const usuarios: Usuario[] = [
    { email: "ana@example.com", password: "1234" },
    { email: "juan@example.com", password: "abcd" }
];
export function login(email: string, password: string): boolean {
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        console.log(` Bienvenido ${usuario.email}`);
        return true;
    } else {
        console.log(" Credenciales incorrectas");
        return false;
    }
}