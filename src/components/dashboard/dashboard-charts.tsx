"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";

interface DashboardChartsProps {
  monthlyTrends: Array<{
    bulan: string;
    masuk: number;
    keluar: number;
  }>;
  fungsiDistribution: Array<{
    fungsiNama: string;
    totalKeluar: number;
  }>;
}

const COLORS = [
  "#0284C7", // Sky Blue
  "#F97316", // Orange
  "#0F2F64", // BPS Navy
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#64748B", // Slate
  "#14B8A6", // Teal
];

export default function DashboardCharts({
  monthlyTrends,
  fungsiDistribution,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Bar Chart Tren Mutasi 6 Bulan Terakhir (Span 2) */}
      <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Tren Mutasi Pengadaan vs Distribusi
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Perbandingan kuantitas barang masuk (pengadaan) dan barang keluar (penyaluran)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F2F64",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="masuk"
                  name="Barang Masuk"
                  fill="#0284C7"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="keluar"
                  name="Barang Keluar"
                  fill="#F97316"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Donut / Pie Chart Distribusi Penyaluran per Seksi / Fungsi (Span 1) */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-orange-600" />
            Distribusi per Seksi / Fungsi
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Proporsi pengeluaran ATK per unit kerja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-[220px] w-full">
            {fungsiDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data distribusi.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fungsiDistribution}
                    dataKey="totalKeluar"
                    nameKey="fungsiNama"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {fungsiDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F2F64",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      border: "none",
                    }}
                    formatter={(value: any, name: any) => [`${value} Unit`, `${name}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend list */}
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 text-xs mt-2">
            {fungsiDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium truncate">{item.fungsiNama}</span>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  {item.totalKeluar} Unit
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
