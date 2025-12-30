export const dynamic = "force-dynamic";

export default function RetornoPago() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
      <h1 className="text-5xl font-black mb-4 text-green-600">¡Pago Exitoso!</h1>
      <p className="text-lg text-slate-500 mb-6">Gracias por confiar en Fleexa Space</p>
      <a
        href="/dashboard"
        className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.97]"
      >
        Ir al Dashboard
      </a>
    </div>
  );
}
