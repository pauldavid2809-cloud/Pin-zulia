import { BookingData } from "@/components/BookingSection";

const BOT_URL = "http://127.0.0.1:3001";

export async function sendWhatsAppNotificationForBooking(booking: BookingData, baseUrl?: string) {
  if (!booking || !booking.clientPhone) {
    return { success: false, error: "Datos de reserva o teléfono incompletos" };
  }

  const domain = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://pin-zulia.vercel.app";
  const ticketUrl = `${domain}/ticket/${booking.bookingCode}`;

  const shoesText = booking.shoeSizes && booking.shoeSizes.length > 0
    ? `${booking.shoeSizes.length} pares (${booking.shoeSizes.join(", ")})`
    : "Sin calzado";

  const message = `🎳 *PinZulia Bowling Boutique & Gastropub (1963)*\n\n` +
    `¡Hola * ${booking.clientName}*! Tu reservación ha sido generada exitosamente.\n\n` +
    `🎟️ *Pase Digital:* #${booking.bookingCode}\n` +
    `🎯 *Servicio:* ${booking.packageName}\n` +
    `📅 *Fecha:* ${booking.date} a las ${booking.time}\n` +
    `👥 *Jugadores:* ${booking.playersCount} Personas\n` +
    `👟 *Calzado Sanitizado:* ${shoesText}\n` +
    (booking.wantsBumpers ? `🛡️ *Bumpers:* Activados para niños\n` : "") +
    `💵 *Total Estimado:* $${booking.totalUSD.toFixed(2)} USD\n\n` +
    `👉 *Abre tu Pase VIP con Código QR aquí:*\n${ticketUrl}\n\n` +
    `📍 *Ubicación:* C.C. Internacional, Av. 5 de Julio, Maracaibo.\n` +
    `_Presenta este boleto digital en la recepción para ingresar a tu pista._`;

  try {
    const res = await fetch(`${BOT_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: booking.clientPhone,
        message,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.log(`ℹ️ Bot local de WhatsApp en puerto 3001 no disponible: ${err.message}`);
    return { success: false, error: err.message };
  }
}
