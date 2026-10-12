"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  PackageCheck, 
  AlertTriangle, 
  Tag, 
  MapPin, 
  Check, 
  X, 
  AlertCircle,
  FileSpreadsheet,
  Download,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  getBarangList, 
  getBarangMasterDropdowns, 
  getNextKodeBarang,
  createBarang, 
  updateBarang, 
  deleteBarang 
} from "@/actions/barang.actions";
import { BarangItem, StatusStok } from "@/types";
import { formatRupiah } from "@/lib/utils";

export default function InventarisAdminPage() {
  const [items, setItems] = useState<BarangItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; nama: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; nama: string }>>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; nama: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | StatusStok>("ALL");

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BarangItem | null>(null);
  const [nextCodePreview, setNextCodePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form States for Create
  const [createForm, setCreateForm] = useState({
    namaBarang: "",
    kategoriId: "",
    satuanId: "",
    gudangId: "",
    minStok: 5,
    hargaEstimasi: 0,
  });

  // Form States for Edit
  const [editForm, setEditForm] = useState({
    namaBarang: "",
    kategoriId: "",
    satuanId: "",
    gudangId: "",
    minStok: 5,
    hargaEstimasi: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    const [resList, resDropdowns] = await Promise.all([
      getBarangList(),
      getBarangMasterDropdowns(),
    ]);

    if (resList.success && resList.data) {
      setItems(resList.data.items);
    }
    if (resDropdowns.success && resDropdowns.data) {
      setCategories(resDropdowns.data.kategori);
      setUnits(resDropdowns.data.satuan);
      setWarehouses(resDropdowns.data.gudang);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = async () => {
    const resCode = await getNextKodeBarang();
    if (resCode.success && resCode.data) {
      setNextCodePreview(resCode.data);
    }
    setCreateForm({
      namaBarang: "",
      kategoriId: categories[0]?.id || "",
      satuanId: units[0]?.id || "",
      gudangId: warehouses[0]?.id || "",
      minStok: 5,
      hargaEstimasi: 0,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    const res = await createBarang({
      namaBarang: createForm.namaBarang,
      kategoriId: createForm.kategoriId,
      satuanId: createForm.satuanId,
      gudangId: createForm.gudangId,
      minStok: Number(createForm.minStok),
      hargaEstimasi: createForm.hargaEstimasi > 0 ? Number(createForm.hargaEstimasi) : null,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Barang berhasil ditambahkan." });
      setCreateDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal menambahkan barang." });
    }
  };

  const handleOpenEdit = (item: BarangItem) => {
    setSelectedItem(item);
    setEditForm({
      namaBarang: item.namaBarang,
      kategoriId: item.kategoriId,
      satuanId: item.satuanId,
      gudangId: item.gudangId,
      minStok: item.minStok,
      hargaEstimasi: item.hargaEstimasi || 0,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await updateBarang(selectedItem.id, {
      namaBarang: editForm.namaBarang,
      kategoriId: editForm.kategoriId,
      satuanId: editForm.satuanId,
      gudangId: editForm.gudangId,
      minStok: Number(editForm.minStok),
      hargaEstimasi: editForm.hargaEstimasi > 0 ? Number(editForm.hargaEstimasi) : null,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Data barang berhasil diperbarui." });
      setEditDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal memperbarui barang." });
    }
  };

  const handleOpenDelete = (item: BarangItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await deleteBarang(selectedItem.id);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Barang berhasil dihapus." });
      setDeleteDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal menghapus barang." });
    }
  };

  // Filtered Items Memo
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategoriNama.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "ALL" || item.kategoriId === selectedCategory;

      const matchWarehouse =
        selectedWarehouse === "ALL" || item.gudangId === selectedWarehouse;

      const matchStatus =
        selectedStatus === "ALL" || item.statusStok === selectedStatus;

      return matchSearch && matchCategory && matchWarehouse && matchStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedWarehouse, selectedStatus]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = items.length;
    const totalPhysicalUnits = items.reduce((acc, curr) => acc + curr.stok, 0);
    const critical = items.filter((i) => i.stok <= i.minStok && i.stok > 0).length;
    const empty = items.filter((i) => i.stok === 0).length;
    return { total, totalPhysicalUnits, critical, empty };
  }, [items]);

  const getStatusBadge = (status: StatusStok) => {
    switch (status) {
      case "TERSEDIA":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
            Tersedia
          </Badge>
        );
      case "MENIPIS":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-bold">
            Stok Menipis
          </Badge>
        );
      case "HABIS":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] font-bold">
            Habis
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Katalog Master Persediaan</h1>
            <Badge variant="outline" className="bg-blue-50 text-[#0F2F64] border-blue-200 font-bold">
              {items.length} Master Item
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data barang, kategori, satuan standar, lokasi gudang, dan ambang batas stok minimum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold gap-2 shadow-md shadow-blue-950/20 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Tambah Barang Baru
          </Button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {actionMessage.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Varian Barang</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
              <p className="text-[11px] text-slate-400">Item aktif</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2F64]">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Saldo Fisik</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.totalPhysicalUnits.toLocaleString("id-ID")}</h3>
              <p className="text-[11px] text-slate-400">Unit di gudang</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <PackageCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Stok Menipis (≤ Min)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.critical}</h3>
              <p className="text-[11px] text-amber-600 font-medium">Perlu pengadaan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Stok Kosong (0)</p>
              <h3 className="text-2xl font-black text-red-600 mt-0.5">{stats.empty}</h3>
              <p className="text-[11px] text-red-500 font-medium">Habis total</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari kode ID-xxx, nama barang persediaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white"
            >
              <option value="ALL">Semua Kategori ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>

            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white"
            >
              <option value="ALL">Semua Gudang ({warehouses.length})</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.nama}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="MENIPIS">Menipis</option>
              <option value="HABIS">Habis</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              title="Muat Ulang"
              className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-slate-900"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Barang Persediaan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4">Gudang</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Saldo Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0F2F64] rounded-full animate-spin" />
                      <p className="text-xs">Memuat katalog master barang...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada barang persediaan ditemukan</p>
                    <p className="text-xs text-slate-500">Sesuaikan filter atau tambahkan barang baru.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">
                      {item.kodeBarang}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 leading-snug">{item.namaBarang}</p>
                      {item.hargaEstimasi && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Est: {formatRupiah(item.hargaEstimasi)}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {item.kategoriNama}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-semibold">
                        {item.satuanNama}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {item.gudangNama}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(item.statusStok)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`text-base font-black ${
                        item.stok <= 0 ? "text-red-600" : item.stok <= item.minStok ? "text-amber-600" : "text-slate-900"
                      }`}>
                        {item.stok}
                      </span>{" "}
                      <span className="text-xs text-slate-500 font-semibold">{item.satuanNama}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Master Barang"
                        className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(item)}
                        title="Hapus Master Barang"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DIALOG 1: TAMBAH BARANG BARU */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#0F2F64]" />
              Tambah Barang Persediaan Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kode otomatis: <strong className="text-[#0F2F64] font-mono">{nextCodePreview}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nama Barang Persediaan *</label>
              <Input
                type="text"
                placeholder="Contoh: Kertas Continuous Form 3 Ply"
                value={createForm.namaBarang}
                onChange={(e) => setCreateForm({ ...createForm, namaBarang: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Kategori *</label>
                <select
                  value={createForm.kategoriId}
                  onChange={(e) => setCreateForm({ ...createForm, kategoriId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Satuan Standar *</label>
                <select
                  value={createForm.satuanId}
                  onChange={(e) => setCreateForm({ ...createForm, satuanId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Lokasi Gudang *</label>
                <select
                  value={createForm.gudangId}
                  onChange={(e) => setCreateForm({ ...createForm, gudangId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Batas Stok Minimum</label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.minStok}
                  onChange={(e) => setCreateForm({ ...createForm, minStok: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Estimasi Harga Satuan (Rp, Opsional)</label>
              <Input
                type="number"
                min="0"
                placeholder="Contoh: 55000"
                value={createForm.hargaEstimasi || ""}
                onChange={(e) => setCreateForm({ ...createForm, hargaEstimasi: parseFloat(e.target.value) || 0 })}
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold">
                {submitting ? "Menyimpan..." : "Simpan Barang Baru"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT BARANG */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sky-600" />
              Edit Data Master Barang
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kode: <strong className="font-mono text-slate-700">{selectedItem?.kodeBarang}</strong> • Stok Fisik Saat Ini: <strong className="text-emerald-700">{selectedItem?.stok} {selectedItem?.satuanNama}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nama Barang Persediaan *</label>
              <Input
                type="text"
                value={editForm.namaBarang}
                onChange={(e) => setEditForm({ ...editForm, namaBarang: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Kategori *</label>
                <select
                  value={editForm.kategoriId}
                  onChange={(e) => setEditForm({ ...editForm, kategoriId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Satuan Standar *</label>
                <select
                  value={editForm.satuanId}
                  onChange={(e) => setEditForm({ ...editForm, satuanId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Lokasi Gudang *</label>
                <select
                  value={editForm.gudangId}
                  onChange={(e) => setEditForm({ ...editForm, gudangId: e.target.value })}
                  required
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Batas Stok Minimum</label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.minStok}
                  onChange={(e) => setEditForm({ ...editForm, minStok: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Estimasi Harga Satuan (Rp, Opsional)</label>
              <Input
                type="number"
                min="0"
                value={editForm.hargaEstimasi || ""}
                onChange={(e) => setEditForm({ ...editForm, hargaEstimasi: parseFloat(e.target.value) || 0 })}
                className="mt-1 h-10 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold">
                {submitting ? "Memperbarui..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: KONFIRMASI HAPUS */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Konfirmasi Hapus Barang
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus barang <strong>{selectedItem?.namaBarang}</strong> ({selectedItem?.kodeBarang})?
              <br /><br />
              <span className="text-slate-500 italic">Catatan: Barang yang memiliki riwayat transaksi masuk/keluar tidak dapat dihapus demi menjaga integritas pembukuan logistik.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {submitting ? "Menghapus..." : "Ya, Hapus Barang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
