"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useGoogleSignIn } from "@/actions/googleSignIn";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useGoogleSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoadingEmail(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      let msg = "No pudimos iniciar sesión. Intenta nuevamente.";
      if (err.code === "auth/user-not-found") {
        msg = "No encontramos una cuenta con ese correo.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Contraseña incorrecta. Revisa tus datos.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Inténtalo más tarde.";
      }
      setError(msg);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("No pudimos iniciar sesión con Google.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white font-sans selection:bg-indigo-100">

      {/* SECCIÓN IZQUIERDA */}
      <div className="hidden lg:flex relative bg-[#0B0E14] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl p-8"
          >
            <div className="flex gap-2 mb-8">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
            </div>

            <div className="space-y-6">
              <div className="h-4 w-1/3 bg-white/10 rounded-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-xl bg-white/5 border border-white/5 p-4 space-y-2">
                  <div className="h-2 w-1/2 bg-indigo-500/40 rounded-full" />
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                </div>
                <div className="h-24 rounded-xl bg-indigo-600/10 border border-indigo-500/20 p-4 space-y-2">
                  <div className="h-2 w-1/2 bg-indigo-400/40 rounded-full" />
                  <div className="h-2 w-full bg-indigo-400/20 rounded-full" />
                </div>
              </div>
              <div className="h-32 rounded-xl bg-white/5 border border-white/5 w-full flex items-center justify-center">
                <div className="text-white/10 font-bold text-4xl">FLEEXA</div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 text-center lg:text-left">
            <h2 className="text-white text-2xl font-bold mb-2">Potencia tu flujo de trabajo</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              La herramienta preferida para quienes buscan orden, <br /> velocidad y un diseño impecable.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="flex flex-col bg-slate-50/50">
        <div className="p-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-[400px]"
          >

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Fleexa Space</span>
            </div>

            {/* TITULO */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido</h1>
              <p className="text-slate-500 mt-2 font-medium italic">Todo listo para seguir creando.</p>
            </div>

            {/* CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
              <style>
                {`
                  input:-webkit-autofill {
                    color: black !important;
                    -webkit-text-fill-color: black !important;
                  }
                `}
              </style>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">

                {/* EMAIL INPUT */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Email</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 
                                 text-sm !text-black focus:bg-white focus:border-indigo-600 
                                 focus:ring-4 focus:ring-indigo-600/5 outline-none"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ color: 'black' }}
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div>
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Password</label>
                    <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">¿Olvidaste la clave?</a>
                  </div>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 
                                 text-sm !text-black focus:bg-white focus:border-indigo-600 
                                 focus:ring-4 focus:ring-indigo-600/5 outline-none"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ color: 'black' }}
                    />
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loadingEmail || loadingGoogle}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm 
                             shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] 
                             flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loadingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingresar"}
                </button>

              </form>

              {/* DIVIDER */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="bg-white px-4">O continuar con</span>
                </div>
              </div>

              {/* GOOGLE BUTTON */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loadingEmail || loadingGoogle}
                className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-700 
                           font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all 
                           flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <img src="/google-icon.png" className="h-5 w-5" alt="Google" />
                    Google
                  </>
                )}
              </button>

            </div>

            <p className="text-center mt-8 text-sm text-slate-500 font-medium">
              ¿No tienes cuenta? <a href="/register" className="text-indigo-600 font-bold hover:underline ml-1">Regístrate ahora</a>
            </p>

          </motion.div>
        </div>
      </div>
    </main>
  );
}
