import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Fleexa Space",
    template: "%s • Fleexa Space",
  },
  description: "Tu espacio de trabajo inteligente para freelancers y pequeños negocios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
