"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const supabase = createClient(); const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6"><Stethoscope className="w-6 h-6 text-teal-400"/><span className="text-xl font-bold text-white">MediBook</span></div>
        <h2 className="text-lg font-semibold text-white mb-4">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500"/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500"/>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl">{loading?"Signing in...":"Sign In"}</button>
        </form>
        <p className="text-center text-slate-500 text-sm mt-4">No account? <Link href="/register" className="text-teal-400 hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
