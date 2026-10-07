import { login } from "login";
import { mostrarMesasDisponibles } from "table-list";
console.log("===== SISTEMA DE RESERVAS v1.0.0 =====");
const acceso = login("ana@example.com", "1234");
if (acceso) {
    console.log("Acceso concedido ");
    mostrarMesasDisponibles();
} else {
    console.log("Acceso denegado ");
}
export function procesarReserva(cliente: string, total: number): string {
    console.log(`Procesando reserva para ${cliente}.`);
    console.log(`Total a pagar: ${total} €`);
    return "Reserva completada correctamente.";
}
console.log();
