"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Boxes, 
  CheckCircle2, 
  ShieldCheck,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GithubBadge } from "@/components/layout/github-badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Silakan masukkan Username / NIP dan Password Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password: password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setErrorMessage("Username / NIP atau kata sandi yang Anda masukkan salah.");
        } else {
          setErrorMessage(res.error || "Gagal masuk. Periksa kembali username dan kata sandi Anda.");
        }
        setIsLoading(false);
      } else if (res?.ok) {
        const targetUrl = res?.url || callbackUrl;
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      console.error("Autentikasi login error:", err);
      setErrorMessage("Terjadi gangguan saat menghubungkan ke server autentikasi.");
      setIsLoading(false);
    }
  };

  const handleFillAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <Card className="border-slate-200/90 shadow-xl shadow-slate-200/60 bg-white rounded-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#0F2F64] via-[#0284C7] to-[#F97316]" />

      <CardHeader className="space-y-1.5 pt-8 pb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-2 text-[#0F2F64]">
          <ShieldCheck className="w-7 h-7 text-[#0F2F64]" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
          Masuk ke SIPBAR
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Sistem Informasi Persediaan Barang BPS Kab. Jeneponto
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in-50 duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Autentikasi Gagal</p>
              <p className="text-xs mt-0.5 text-red-600">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Username atau NIP Pegawai
            </label>
            <Input
              type="text"
              placeholder="Contoh: adminsipbar / imaniar"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-[#0284C7] focus:ring-[#0284C7]/20 text-sm font-medium"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-[#0284C7] focus:ring-[#0284C7]/20 text-sm font-medium pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold shadow-md shadow-blue-900/20 gap-2 mt-2 transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Account Helper Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Akses Cepat Masuk Akun
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillAccount("adminsipbar", "adminsipbar!")}
              className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-[#0F2F64]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F2F64]" />
                Administrator SIPBAR
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">adminsipbar</p>
            </button>

            <button
              type="button"
              onClick={() => handleFillAccount("imaniar", "ima361")}
              className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50 hover:border-sky-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-sky-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                Pegawai (Imaniar)
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">imaniar</p>
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 flex items-center justify-center">
        <p className="text-xs text-slate-500 text-center">
          Lupa kata sandi? Hubungi Tim IT / Super Admin BPS Kabupaten Jeneponto.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navbar Minimalis */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2F64] to-[#0284C7] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0F2F64] tracking-tight">SIPBAR</span>
                <Badge variant="outline" className="text-[10px] font-bold text-sky-700 bg-sky-50 border-sky-200">
                  BPS 7304
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">BPS Kabupaten Jeneponto</p>
            </div>
          </Link>

          <Link href="/katalog">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-[#0F2F64] hover:bg-slate-100 gap-2 font-medium">
              <PackageCheck className="w-4 h-4 text-sky-600" />
              Katalog Barang Kantor
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl shadow-md border border-slate-200">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0F2F64] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Memuat formulir masuk...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-slate-200/60 py-4 px-6 bg-white/60">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Badan Pusat Statistik Kabupaten Jeneponto. Hak Cipta Dilindungi.</p>
          <GithubBadge />
        </div>
      </footer>
    </div>
  );
}
