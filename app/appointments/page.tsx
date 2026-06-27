import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function AppointmentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: appointments } = await supabase.from("appointments")
    .select("*, doctor:profiles!doctor_id(full_name, avatar_url), patient:profiles!patient_id(full_name)")
    .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Appointments</h1>
        {!appointments?.length ? (
          <p className="text-slate-500 text-center py-12">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Dr. {apt.doctor?.full_name}</p>
                  <p className="text-slate-400 text-sm">{new Date(apt.scheduled_at).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{apt.duration_minutes} minutes</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === "confirmed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{apt.status}</span>
                  {apt.video_room_url && <a href={apt.video_room_url} target="_blank" className="block mt-2 text-xs text-blue-400 hover:underline">Join Video Call</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
