import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DoctorCard from "@/components/booking/DoctorCard";
interface Props { searchParams: { specialty?: string; location?: string; q?: string; } }
export default async function FindDoctorsPage({ searchParams }: Props) {
  const supabase = createClient();
  let query = supabase.from("doctors").select("*, profiles!inner(id, full_name, avatar_url, location)").eq("verified", true);
  if (searchParams.specialty) query = query.eq("specialty", searchParams.specialty);
  const { data: doctors, error } = await query.limit(24);
  if (error) return <div className="text-red-400 p-8">Error loading doctors</div>;
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Find a Doctor</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors?.map((doc: any) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
        {(!doctors || doctors.length === 0) && <p className="text-center text-slate-500 py-12">No doctors found</p>}
      </div>
    </div>
  );
}
