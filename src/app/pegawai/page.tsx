import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPegawaiDashboardData, getBarangTersediaForPengambilan } from "@/actions/pegawai.actions";
import { PegawaiDashboardClient } from "@/components/pegawai/pegawai-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Pegawai — SIPBAR BPS Kabupaten Jeneponto",
  description: "Portal Layanan Mandiri Pengambilan Barang Persediaan Kantor BPS Kabupaten Jeneponto",
};

export default async function PegawaiPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/pegawai");
  }

  const [dashboardRes, itemsRes] = await Promise.all([
    getPegawaiDashboardData(),
    getBarangTersediaForPengambilan(),
  ]);

  if (!dashboardRes.success || !dashboardRes.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-md max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
          <p className="text-xs text-slate-600 mb-4">{dashboardRes.error || "Gagal memuat profil pegawai."}</p>
          <a
            href="/login"
            className="inline-block bg-[#0F2F64] text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Masuk Kembali
          </a>
        </div>
      </div>
    );
  }

  return (
    <PegawaiDashboardClient
      initialData={dashboardRes.data}
      availableItems={itemsRes.data || []}
    />
  );
}
