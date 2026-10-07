export function procesarReserva(cliente: string, total: number): string {
 console.log(`Procesando reserva para ${cliente}.`);
 console.log(`Total a pagar: ${total} €`);
 let puntosGanados = Math.floor(total / 10);
 console.log(` El cliente ${cliente} ha ganado ${puntosGanados} puntos.`);

 return "Reserva completada correctamente con puntos de recompensa.";
}