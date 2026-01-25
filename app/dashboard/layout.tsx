export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 overflow-hidden">
      {children}
    </div>
  );
}
