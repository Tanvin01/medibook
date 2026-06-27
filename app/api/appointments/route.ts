import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appointmentSchema } from "@/lib/validations";
import { sendAppointmentConfirmation } from "@/lib/mailer";
import { createVideoRoom } from "@/lib/daily";

// GET /api/appointments — list user's appointments
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming") === "true";

  let query = supabase
    .from("appointments")
    .select(`
      *,
      doctor:profiles!doctor_id(id, full_name, avatar_url, specialty),
      patient:profiles!patient_id(id, full_name, avatar_url)
    `)
    .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .order("scheduled_at", { ascending: true });

  if (status) query = query.eq("status", status);
  if (upcoming) query = query.gte("scheduled_at", new Date().toISOString());

  const { data, error } = await query;

  if (error) {
    console.error("[APPOINTMENTS_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/appointments — book appointment
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = appointmentSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
  }

  const { doctorId, scheduledAt, durationMinutes, notes } = validated.data;

  // Check slot availability
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("scheduled_at", scheduledAt)
    .neq("status", "cancelled")
    .single();

  if (conflict) {
    return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
  }

  // Create Daily.co video room
  const videoRoom = await createVideoRoom(scheduledAt, durationMinutes);

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: doctorId,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes ?? 30,
      notes,
      video_room_url: videoRoom.url,
      status: "pending",
    })
    .select(`*, doctor:profiles!doctor_id(id, full_name, avatar_url)`)
    .single();

  if (error) {
    console.error("[APPOINTMENTS_POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email asynchronously
  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, email:users(email)")
    .eq("id", user.id)
    .single();

  if (patient) {
    await sendAppointmentConfirmation(appointment, patient).catch(console.error);
  }

  return NextResponse.json(appointment, { status: 201 });
}
