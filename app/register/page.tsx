"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useGoogleSignIn } from "@/actions/googleSignIn";
import { syncUserToNeon } from "@/actions/neonOperations";
import { syncUserToFirestore } from "@/actions/firestoreOperations";
import { motion } from "framer-motion";
import PasswordInput from "@/app/components/ui/PasswordInput";
import { ArrowLeft, Loader2, Mail, UserPlus, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signInWithGoogle } = useGoogleSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Sincronizar usuario a Neon y Firestore en paralelo
      const syncResults = await Promise.all([
        syncUserToNeon(user.uid, email),
        syncUserToFirestore(user.uid, email),
      ]);

      // Verificar que la sincronización a Neon fue exitosa
      if (!syncResults[0]) {
        throw new Error("No se pudo sincronizar el usuario con la base de datos. Intenta nuevamente.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No pudimos crear la cuenta. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white font-sans selection:bg-indigo-100">
      
      {/* SECCIÓN IZQUIERDA: BRANDING & VALOR */}
      <div className="hidden lg:flex relative bg-[#0B0E14] items-center justify-center p-12 overflow-hidden">
        {/* Efectos de luz ambiental */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/40 backdrop-blur-3xl rounded-3xl border border-white/5 p-8 shadow-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              COMIENZA GRATIS
            </div>
            
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Lleva tus proyectos al <span className="text-indigo-400 italic">siguiente nivel.</span>
            </h2>
            
            <ul className="space-y-4 mt-8">
              {[
                "Configuración en menos de 1 minuto",
                "Sin necesidad de tarjeta de crédito",
                "Dashboard personalizado incluido",
                "Acceso a la comunidad de freelancers"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="flex flex-col bg-slate-50/50">
        <div className="p-8">
          <button 
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-[420px]"
          >
            {/* LOGO ORIGINAL */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Fleexa Space</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crea tu cuenta</h1>
              <p className="text-slate-500 mt-2 font-medium">Únete a cientos de profesionales organizados.</p>
            </div>

            {/* CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
              {error && (
                <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Email</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none !text-black"
                      placeholder="nombre@ejemplo.com"
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ color: 'black' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Contraseña</label>
                  <div className="relative mt-2">
                    <PasswordInput
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Crear mi cuenta
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="bg-white px-4">O regístrate con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
              >
                <img src="/google-icon.png" className="h-5 w-5" alt="Google" />
                Google
              </button>
            </div>

            <p className="text-center mt-8 text-sm text-slate-500 font-medium">
              ¿Ya tienes una cuenta? <a href="/login" className="text-indigo-600 font-bold hover:underline ml-1">Inicia sesión</a>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}