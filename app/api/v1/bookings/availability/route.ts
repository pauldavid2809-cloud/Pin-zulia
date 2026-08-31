import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

declare global {
  var __PINZULIA_BOOKED_SLOTS__: Map<string, { laneNumber: number; bookingCode: string; status: string; clientName: string; expiresAt?: string }> | undefined;
}

if (!global.__PINZULIA_BOOKED_SLOTS__) {
  global.__PINZULIA_BOOKED_SLOTS__ = new Map();
  const today = new Date().toISOString().split("T")[0];
  global.__PINZULIA_BOOKED_SLOTS__.set(`${today}_07:00 PM_7`, {
    laneNumber: 7,
    bookingCode: "PIN-7401",
    status: "CONFIRMADA",
    clientName: "Alejandro Morales",
  });
  global.__PINZULIA_BOOKED_SLOTS__.set(`${today}_08:30 PM_2`, {
    laneNumber: 2,
    bookingCode: "PIN-7402",
    status: "CONFIRMADA",
    clientName: "Familia González",
  });
}

const bookedSlots = global.__PINZULIA_BOOKED_SLOTS__;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const time = searchParams.get("time") || "08:00 PM (Prime Time)";

    const occupiedLanes: number[] = [];
    const holdLanes: number[] = [];

    const now = Date.now();
    for (const [key, slot] of bookedSlots.entries()) {
      if (key.startsWith(`${date}_${time}_`)) {
        if (slot.status === "HOLD" && slot.expiresAt && new Date(slot.expiresAt).getTime() < now) {
          bookedSlots.delete(key);
          continue;
        }

        if (slot.status === "CONFIRMADA" || slot.status === "EN_PISTA") {
          occupiedLanes.push(slot.laneNumber);
        } else if (slot.status === "HOLD") {
          holdLanes.push(slot.laneNumber);
        }
      }
    }

    if (supabase) {
      try {
        const { data: dbBookings } = await supabase
          .from("bookings")
          .select("lane_number, status, expires_at")
          .eq("booking_date", date)
          .eq("booking_time", time);

        if (dbBookings && dbBookings.length > 0) {
          for (const row of dbBookings) {
            const laneNum = Number(row.lane_number);
            if (row.status === "CONFIRMADA" || row.status === "EN_PISTA") {
              if (!occupiedLanes.includes(laneNum)) occupiedLanes.push(laneNum);
            } else if (row.status === "HOLD") {
              if (row.expires_at && new Date(row.expires_at).getTime() > now) {
                if (!holdLanes.includes(laneNum)) holdLanes.push(laneNum);
              }
            }
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      date,
      time,
      occupiedLanes,
      holdLanes,
      allUnavailableLanes: Array.from(new Set([...occupiedLanes, ...holdLanes])),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      date,
      time,
      laneNumber,
      bookingCode,
      clientName,
      clientPhone,
      status = "HOLD",
      serviceType = "bowling",
      totalUSD = 25.0,
    } = body;

    if (!date || !time || !laneNumber || !bookingCode) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    const slotKey = `${date}_${time}_${laneNumber}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    bookedSlots.set(slotKey, {
      laneNumber: Number(laneNumber),
      bookingCode,
      status,
      clientName: clientName || "Cliente",
      expiresAt,
    });

    if (supabase) {
      try {
        await supabase.from("bookings").upsert({
          booking_code: bookingCode,
          booking_date: date,
          booking_time: time,
          lane_number: Number(laneNumber),
          client_name: clientName,
          client_phone: clientPhone,
          service_type: serviceType,
          status,
          total_usd: totalUSD,
          expires_at: status === "HOLD" ? expiresAt : null,
          created_at: new Date().toISOString(),
        }, { onConflict: "booking_code" });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      slotKey,
      status,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
