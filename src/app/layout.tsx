import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPBAR — Sistem Informasi Persediaan Barang BPS Kabupaten Jeneponto",
  description: "Aplikasi Terpadu Pengelolaan dan Monitoring Barang Persediaan Badan Pusat Statistik Kabupaten Jeneponto",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

