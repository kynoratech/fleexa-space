"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Briefcase, 
  CheckSquare, 
  ShieldCheck, 
  Users, 
  Users2, 
  ArrowRight,
  Zap,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* NAVBAR ESTILO SAAS CON TU LOGO ORIGINAL */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Logo Original reintegrado */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                <img
                  src="/favicon.ico"
                  alt="Fleexa Space Logo"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  Fleexa Space
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Workspace para freelancers
                </span>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
              {["Producto", "Funcionalidades", "Planes", "Sobre Fleexa"].map((label) => (
                <a key={label} href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2">
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              Crear cuenta gratis
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-20 pb-24 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-fuchsia-100/50 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8"
          >
            <Star className="h-3 w-3 fill-indigo-700" />
            DISEÑADO PARA FREELANCERS & PYMES
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6"
          >
            Organiza tu trabajo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
              a tu propio ritmo.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed"
          >
            Fleexa Space centraliza clientes, proyectos, tareas y presupuestos en un solo lugar. Menos caos administrativo, más tiempo para lo importante.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              Comenzar gratis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-all">
              Ver cómo funciona
            </button>
          </motion.div>
        </div>
      </header>

      {/* FEATURES PRINCIPALES */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Tu trabajo, ordenado de verdad.</h2>
              <p className="text-slate-600">Todo tiene contexto, nada queda suelto en Fleexa Space.</p>
            </div>
            <p className="text-sm font-medium text-slate-400">Empieza gratis · Sin tarjeta · Cancela cuando quieras</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Users, 
                color: "bg-indigo-50 text-indigo-600", 
                title: "Clientes y proyectos", 
                desc: "Cada cliente con su historial completo. Proyectos, tareas y reuniones vinculadas." 
              },
              { 
                icon: CheckSquare, 
                color: "bg-emerald-50 text-emerald-600", 
                title: "Agenda clara", 
                desc: "Vistas diaria, semanal y mensual. Prioridades reales para el trabajo diario." 
              },
              { 
                icon: Briefcase, 
                color: "bg-sky-50 text-sky-600", 
                title: "Presupuestos", 
                desc: "Plantillas reutilizables y exportación PDF para un flujo profesional." 
              },
              { 
                icon: BarChart3, 
                color: "bg-amber-50 text-amber-600", 
                title: "Finanzas simples", 
                desc: "Resumen mensual de ingresos por cliente. Información para decidir rápido." 
              },
              { 
                icon: Users2, 
                color: "bg-fuchsia-50 text-fuchsia-600", 
                title: "Colaboración", 
                desc: "Invita a tu equipo con roles claros y registro de actividad sencillo." 
              },
              { 
                icon: ShieldCheck, 
                color: "bg-slate-100 text-slate-600", 
                title: "Seguro y confiable", 
                desc: "Login con Google, sesiones seguras y exportación de datos garantizada." 
              }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all"
              >
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-6`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{f.desc}</p>
                <div className="h-px bg-slate-200 w-full mb-4" />
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Saber más <ArrowRight className="h-3 w-3" />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Empieza gratis, crece a tu ritmo.</h2>
          <p className="text-slate-600 mb-12">Prueba Fleexa con tus proyectos reales hoy mismo.</p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-10 rounded-3xl border border-emerald-200 shadow-xl shadow-emerald-100/20 relative">
              <div className="absolute top-6 right-8 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Recomendado</div>
              <h3 className="text-xl font-bold mb-1">Plan Inicial</h3>
              <div className="text-4xl font-black my-6">$0 <span className="text-sm text-slate-400 font-normal">por tiempo limitado</span></div>
              <ul className="space-y-4 mb-10">
                {["Clientes ilimitados", "Agenda semanal", "Presupuestos básicos", "Acceso multidispositivo"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">Crear cuenta gratis</button>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-slate-200 opacity-80">
              <h3 className="text-xl font-bold mb-1 text-slate-400 italic">Próximamente...</h3>
              <h3 className="text-xl font-bold mb-1">Plan Equipo</h3>
              <div className="text-4xl font-black my-6 text-slate-300">--</div>
              <ul className="space-y-4 mb-10">
                {["Roles y permisos", "Reportes avanzados", "Soporte prioritario", "API Access"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER RE-BRANDED */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <img src="/favicon.ico" className="h-4 w-4" alt="" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">Fleexa Space</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Producto</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Planes</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Seguridad</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Fleexa Space. Hecho para creadores.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}