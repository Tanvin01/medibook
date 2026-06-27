import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: upcoming } = await supabase.from("appointments")
    .select("*, doctor:profiles!doctor_id(full_name)")
    .eq("patient_id", user.id).gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at").limit(3);
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome, {profile?.full_name ?? "Patient"}</h1>
        <p className="text-slate-400 text-sm mb-8">Manage your healthcare appointments</p>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[{label:"Upcoming",value:upcoming?.length??0,icon:Calendar},{label:"This Month",value:0,icon:Clock},{label:"Total",value:0,icon:User}].map(({label,value,icon:Icon})=>(
            <div key={label} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Icon className="w-4 h-4"/>{label}</div>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-teal-400 text-sm hover:underline">View all</Link>
          </div>
          {!upcoming?.length ? <p className="text-slate-500 text-sm">No upcoming appointments. <Link href="/find-doctors" className="text-teal-400 hover:underline">Book one now</Link></p> : (
            upcoming.map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div><p className="text-white font-medium">Dr. {apt.doctor?.full_name}</p><p className="text-slate-400 text-sm">{new Date(apt.scheduled_at).toLocaleString()}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs ${apt.status==="confirmed"?"bg-green-500/10 text-green-400":"bg-yellow-500/10 text-yellow-400"}`}>{apt.status}</span>
              </div>
            ))
          )}
        </div>
        <Link href="/find-doctors" className="block w-full text-center bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 rounded-xl transition-colors">Find a Doctor</Link>
      </div>
    </div>
  );
}
