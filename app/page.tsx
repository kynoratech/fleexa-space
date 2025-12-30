"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { 
  BarChart3, 
  Briefcase, 
  CheckSquare, 
  ShieldCheck, 
  Users, 
  Users2, 
  ArrowRight,
  Zap,
  Star,
  Glasses,
  Lock,
  Globe,
  LifeBuoy,
  MessageCircle,
  Clock
} from "lucide-react";

// --- COMPONENTE MASCOTA INTERACTIVA ---
function Mascot() {
  const { scrollYProgress } = useScroll();
  
  const yPos = useTransform(scrollYProgress, [0, 0.2, 1], [100, 0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const sunglassesOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const sunglassesY = useTransform(scrollYProgress, [0.3, 0.5], [-20, 0]);
  const rocketFire = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);

  return (
    <motion.div 
      style={{ y: yPos, opacity }}
      className="fixed right-6 bottom-6 z-[100] hidden xl:flex flex-col items-center"
    >
      <div className="relative">
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="h-14 w-14 bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center border border-indigo-500/30 overflow-hidden"
        >
          <div className="flex gap-1.5">
            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" />
          </div>

          <motion.div 
            style={{ opacity: sunglassesOpacity, y: sunglassesY }}
            className="absolute inset-0 flex items-center justify-center bg-slate-900"
          >
            <Glasses className="text-white w-8 h-8" />
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ opacity: rocketFire }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <div className="w-2 h-6 bg-gradient-to-t from-orange-500 to-transparent rounded-full animate-bounce" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 scroll-smooth">
      
      <Mascot />

      {/* NAVBAR */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                <img src="/favicon.ico" alt="Fleexa Space Logo" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base tracking-tight text-slate-900">Fleexa Space</span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block">Workspace para freelancers</span>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
              {[
                { label: "Producto", href: "#producto" },
                { label: "Planes", href: "#planes" },
                { label: "Seguridad", href: "#seguridad" },
                { label: "Soporte", href: "#soporte" }
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-slate-600 hover:text-indigo-600 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2">
              Iniciar sesión
            </a>
            <a href="/register" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95">
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
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8">
            <Star className="h-3 w-3 fill-indigo-700" /> DISEÑADO PARA FREELANCERS & PYMES
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Organiza tu trabajo <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">a tu propio ritmo.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            Fleexa Space centraliza clientes, proyectos, tareas y presupuestos en un solo lugar. Menos caos administrativo, más tiempo para lo importante.
          </motion.p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
             <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /><a href="/register" className="text-white">Comenzar gratis </a>
            </button>
          </div>
        </div>
      </header>

      {/* SECCION: PRODUCTO (Basada en tus Funcionalidades) */}
      <section id="producto" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Un sistema operativo para tu negocio</h2>
            <p className="text-slate-600 text-lg">Diseñado para que no tengas que saltar entre 10 aplicaciones diferentes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, style: "bg-indigo-50 text-indigo-600", title: "CRM Freelance", desc: "Gestiona clientes y leads. Historial de comunicación y archivos en un solo lugar." },
              { icon: CheckSquare, style: "bg-emerald-50 text-emerald-600", title: "Gestión de Tareas", desc: "Kanban, listas y calendarios. Todo lo que necesitas para no perder un deadline." },
              { icon: Briefcase, style: "bg-sky-50 text-sky-600", title: "Presupuestos Pro", desc: "Envía cotizaciones hermosas en PDF. Automatiza el seguimiento con un clic." },
              { icon: BarChart3, style: "bg-amber-50 text-amber-600", title: "Analítica Real", desc: "Mira cuánto estás ganando mes a mes y proyecta tus ingresos futuros." },
              { icon: Users2, style: "bg-fuchsia-50 text-fuchsia-600", title: "Equipo y Colab", desc: "Asigna tareas a colaboradores externos sin exponer toda tu información." },
              { icon: Zap, style: "bg-yellow-50 text-yellow-600", title: "Automatizaciones", desc: "Recordatorios automáticos para que nunca olvides cobrar una factura." }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all">
                <div className={`h-12 w-12 rounded-xl ${f.style} flex items-center justify-center mb-6 shadow-sm`}><f.icon className="h-6 w-6" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCION: SEGURIDAD */}
      <section id="seguridad" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold mb-6">Tu información es tu activo más valioso. <br/><span className="text-indigo-400">La protegemos como tal.</span></h2>
              <div className="space-y-6">
                {[
                  { icon: Lock, title: "Encriptación de grado bancario", desc: "Tus datos viajan y se almacenan con cifrado AES-256." },
                  { icon: ShieldCheck, title: "Cumplimiento legal", desc: "Adaptados a normativas de protección de datos locales e internacionales." },
                  { icon: Globe, title: "Infraestructura robusta", desc: "Servidores en la nube con 99.9% de tiempo de actividad garantizado." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400"><item.icon className="h-5 w-5" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                <code>{`// Fleexa Security Protocol
{
  "auth": "OAuth 2.0 / Google Social Login",
  "encryption": "AES-256-GCM",
  "backups": "Daily Automated",
  "session": "Secure Stateless JWT",
  "status": "Verified & Protected"
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECCION: PLANES (Tu original mejorada) */}
      <section id="planes" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Empieza gratis, crece a tu ritmo.</h2>
          <p className="text-slate-600 mb-12">Planes transparentes para todas las etapas de tu carrera.</p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-10 rounded-3xl border border-emerald-200 shadow-xl shadow-emerald-100/20 relative">
              <div className="absolute top-6 right-8 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Free</div>
              <h3 className="text-xl font-bold mb-1">Plan Gratis</h3>
              <div className="text-4xl font-black my-6 text-slate-900">$0 <span className="text-sm text-slate-400 font-normal">siempre</span></div>
              <ul className="space-y-4 mb-10">
                {["Clientes limitados", "Tareas básicas", "1 Workspace"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</div> {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all"><a href="/register" className="text-white">Crear cuenta gratis</a></button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-10 rounded-3xl border border-indigo-200 shadow-xl shadow-indigo-100/20 relative">
              <div className="absolute top-6 right-8 px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase">PRO</div>
              <h3 className="text-xl font-bold mb-1">Plan Pro</h3>
              <div className="text-4xl font-black my-6 text-slate-900">$9.990 <span className="text-sm text-slate-400 font-normal">/ mes</span></div>
              <ul className="space-y-4 mb-6">
                {["Clientes ilimitados", "Tareas avanzadas", "Workspaces colaborativos", "Exportes PDF PRO"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">✓</div> {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"><a href="/checkout" className="text-white">Pagar con Webpay</a></button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCION: SOPORTE */}
      <section id="soporte" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-indigo-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <LifeBuoy className="h-12 w-12 mx-auto mb-6 text-indigo-200" />
              <h2 className="text-4xl font-black mb-6">¿Necesitas ayuda con algo?</h2>
              <p className="text-indigo-100 mb-10 text-lg">Nuestro equipo humano (y Fleexy) están listos para ayudarte a configurar tu espacio de trabajo.</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="#" className="bg-white text-indigo-600 p-6 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                  <span className="font-bold">Chat en vivo</span>
                  <span className="text-xs opacity-70">Respuesta en 15 min</span>
                </a>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shadow-md">
              <img src="/favicon.ico" className="h-4 w-4" alt="" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Fleexa Space</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#producto" className="hover:text-indigo-600">Producto</a>
            <a href="#planes" className="hover:text-indigo-600">Planes</a>
            <a href="#seguridad" className="hover:text-indigo-600">Seguridad</a>
            <a href="#soporte" className="hover:text-indigo-600">Soporte</a>
          </div>
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} Fleexa Space.</p>
        </div>
      </footer>
    </main>
  );
}