import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CRM",
  description: "CRM moderno com recursos de Inteligência Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
