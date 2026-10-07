export function procesarReserva(cliente: string, total: number): string {
 console.log(`Procesando reserva para ${cliente}.`);
 console.log(`Total a pagar: ${total} €`);
 let puntosGanados = Math.floor(total / 10);
 console.log(` El cliente ${cliente} ha ganado ${puntosGanados} puntos.`);


    console.log(`Procesando reserva para ${cliente}.`);
    let descuento = 0;
    if (cliente === "Juan Pérez") {
        descuento = total * 0.1;
        total -= descuento;
        console.log(` Descuento aplicado de ${descuento.toFixed(2)} €`);
    }
    console.log(`Total a pagar: ${total} €`);
    return "Reserva completada correctamente";
}