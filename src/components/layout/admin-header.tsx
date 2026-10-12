"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, User, LogOut, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTanggal } from "@/lib/utils";

interface AdminHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTanggal(new Date())}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aktif (Online)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="text-xs font-semibold bg-sky-50 text-sky-800 border-sky-200 px-2.5 py-1 flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>{user?.role === "SUPER_ADMIN" ? "Super Admin IT" : "Admin Gudang"}</span>
        </Badge>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || "Pengguna"}</p>
            <p className="text-[11px] text-slate-500">{user?.nip ? `NIP. ${user.nip}` : user?.username}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-8 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
