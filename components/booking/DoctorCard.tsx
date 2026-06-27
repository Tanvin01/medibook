"use client";
import Link from "next/link";
import { MapPin, Star, Clock } from "lucide-react";
interface Doctor { id: string; specialty: string; consultation_fee: number; languages: string[]; bio: string; profiles: { id: string; full_name: string; avatar_url?: string; location?: string; }; }
export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shrink-0">
          {doctor.profiles.full_name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-white">{doctor.profiles.full_name}</h3>
          <p className="text-teal-400 text-sm">{doctor.specialty}</p>
          {doctor.profiles.location && <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{doctor.profiles.location}</p>}
        </div>
      </div>
      {doctor.bio && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{doctor.bio}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />${doctor.consultation_fee} / visit</div>
        <Link href={`/doctors/${doctor.profiles.id}`}
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Book Appointment</Link>
      </div>
    </div>
  );
}
