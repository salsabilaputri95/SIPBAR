"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  BarChart3, 
  Users, 
  PackageSearch,
  LogOut,
  ShieldCheck,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const navigation = [
    {
      group: "UTAMA",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Katalog Persediaan", href: "/inventaris", icon: Boxes },
      ],
    },
    {
      group: "TRANSAKSI PERSEDIAAN",
      items: [
        { name: "Barang Masuk", href: "/transaksi-masuk", icon: ArrowDownLeft },
        { name: "Barang Keluar", href: "/transaksi-keluar", icon: ArrowUpRight },
        { name: "Tanda Terima / BA", href: "/tanda-terima", icon: FileText },
      ],
    },
    {
      group: "LAPORAN & MONITORING",
      items: [
        { name: "Laporan & Ekspor", href: "/laporan", icon: BarChart3 },
        { name: "Katalog Publik", href: "/katalog", icon: PackageSearch },
      ],
    },
  ];

  if (isSuperAdmin) {
    navigation.push({
      group: "PENGATURAN SISTEM",
      items: [
        { name: "Manajemen Pengguna", href: "/pengaturan/users", icon: Users },
      ],
    });
  }

  const roleLabelMap = {
    SUPER_ADMIN: { label: "Super Admin IT", color: "bg-blue-100 text-[#0F2F64] border-blue-200" },
    ADMIN_GUDANG: { label: "Admin Gudang", color: "bg-sky-100 text-sky-800 border-sky-200" },
    PEGAWAI: { label: "Pegawai BPS", color: "bg-slate-100 text-slate-700 border-slate-200" },
  };

  const currentRole = user?.role ? roleLabelMap[user.role] : roleLabelMap.PEGAWAI;

  return (
    <aside className="w-64 bg-[#0F2F64] text-white flex flex-col h-full select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-blue-900/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white shadow-md">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">SIPBAR</span>
              <span className="text-[10px] bg-[#0284C7] text-white px-1.5 py-0.5 rounded font-bold">
                7304
              </span>
            </div>
            <p className="text-[11px] text-blue-200 font-medium">BPS Kab. Jeneponto</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-300/70 mb-2">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-[#0284C7] text-white shadow-md shadow-sky-950/30 font-semibold"
                        : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-blue-300"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Bar */}
      <div className="p-3 border-t border-blue-900/60 bg-[#0A1F42]/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Pengguna"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-blue-200 truncate">
                  {user?.fungsiNama || (user?.role === "SUPER_ADMIN" ? "IT" : "UMUM")}
                </span>
                <span className="text-[10px] text-blue-400">•</span>
                <span className="text-[10px] text-amber-300 font-semibold">{user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar dari sistem"
            className="p-1.5 rounded-lg text-blue-200 hover:text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
