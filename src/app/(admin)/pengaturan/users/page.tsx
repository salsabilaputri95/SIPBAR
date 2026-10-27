"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, 
  UserPlus, 
  Search, 
  KeyRound, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  AlertCircle,
  Building2,
  RefreshCw,
  UserCheck,
  Lock
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
  getUsers, 
  getFungsiList, 
  createUser, 
  updateUser, 
  resetUserPassword, 
  deleteUser 
} from "@/actions/users.actions";

export default function UsersManagementPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [users, setUsers] = useState<any[]>([]);
  const [fungsiList, setFungsiList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Active Selected User for Edit/Reset/Delete
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form states for Create
  const [createForm, setCreateForm] = useState({
    username: "",
    name: "",
    nip: "",
    password: "",
    role: "PEGAWAI",
    fungsiId: "",
  });

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    name: "",
    nip: "",
    role: "PEGAWAI",
    fungsiId: "",
  });

  // Form state for Reset Password
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const [resUsers, resFungsi] = await Promise.all([getUsers(), getFungsiList()]);
    if (resUsers.success && resUsers.data) {
      setUsers(resUsers.data);
    }
    if (resFungsi.success && resFungsi.data) {
      setFungsiList(resFungsi.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    const res = await createUser({
      username: createForm.username,
      name: createForm.name,
      nip: createForm.nip || undefined,
      password: createForm.password,
      role: createForm.role as any,
      fungsiId: createForm.fungsiId || undefined,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Pengguna berhasil ditambahkan." });
      setCreateDialogOpen(false);
      setCreateForm({ username: "", name: "", nip: "", password: "", role: "PEGAWAI", fungsiId: "" });
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal membuat pengguna." });
    }
  };

  const handleEditOpen = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      nip: user.nip || "",
      role: user.role,
      fungsiId: user.fungsiId || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await updateUser(selectedUser.id, {
      name: editForm.name,
      nip: editForm.nip || undefined,
      role: editForm.role as any,
      fungsiId: editForm.fungsiId || undefined,
    });

    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Data pengguna berhasil diperbarui." });
      setEditDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal memperbarui pengguna." });
    }
  };

  const handleResetOpen = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setResetDialogOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await resetUserPassword(selectedUser.id, newPassword);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Password berhasil direset." });
      setResetDialogOpen(false);
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal mereset password." });
    }
  };

  const handleDeleteOpen = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setActionMessage(null);

    const res = await deleteUser(selectedUser.id);
    setSubmitting(false);
    if (res.success) {
      setActionMessage({ type: "success", text: res.message || "Pengguna berhasil dihapus." });
      setDeleteDialogOpen(false);
      loadData();
    } else {
      setActionMessage({ type: "error", text: res.error || "Gagal menghapus pengguna." });
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nip && u.nip.includes(searchQuery));

    const matchRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-[#0F2F64] text-white hover:bg-[#0F2F64]/90 text-[11px] font-bold">Admin</Badge>;
      case "ADMIN_GUDANG":
        return <Badge className="bg-[#0284C7] text-white hover:bg-[#0284C7]/90 text-[11px] font-bold">Admin Gudang</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-[11px] font-semibold">Pegawai</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
            <Badge variant="outline" className="bg-blue-50 text-[#0F2F64] border-blue-200 font-bold">
              {users.length} Akun Terdaftar
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kelola hak akses role, data kepegawaian staf BPS Jeneponto, dan pemulihan kata sandi akun.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white font-semibold gap-2 shadow-md shadow-blue-950/20 rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </Button>
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

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari nama pegawai, username, atau NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm"
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "Semua" },
              { id: "SUPER_ADMIN", label: "Admin" },
              { id: "ADMIN_GUDANG", label: "Admin Gudang" },
              { id: "PEGAWAI", label: "Pegawai" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  roleFilter === tab.id
                    ? "bg-[#0F2F64] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              title="Muat Ulang"
              className="h-8 w-8 p-0 rounded-lg ml-1 text-slate-500 hover:text-slate-900"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap & Akun</th>
                <th className="py-3.5 px-4">NIP</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Seksi / Fungsi</th>
                <th className="py-3.5 px-4">Aktivitas Transaksi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0F2F64] rounded-full animate-spin" />
                      <p className="text-xs">Memuat daftar pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada pengguna ditemukan</p>
                    <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter role.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/70 border border-blue-200 text-[#0F2F64] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{u.name}</p>
                          <p className="text-xs text-slate-500 font-mono">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {u.nip || <span className="text-slate-400 italic">Belum diisi</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      {getRoleBadge(u.role)}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.fungsi ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {u.fungsi.nama}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {u._count ? (
                        <span>
                          <strong className="text-slate-800">{u._count.transaksiMasuk}</strong> Masuk,{" "}
                          <strong className="text-slate-800">{u._count.transaksiKeluar}</strong> Keluar
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetOpen(u)}
                        title="Reset Kata Sandi"
                        className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOpen(u)}
                        title="Edit Profil & Role"
                        className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      {session?.user?.id !== u.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOpen(u)}
                          title="Hapus Pengguna"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DIALOG 1: TAMBAH PENGGUNA BARU */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0F2F64]" />
              Tambah Pengguna Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Buat akun baru untuk pegawai BPS Kabupaten Jeneponto.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Username *</label>
              <Input
                type="text"
                placeholder="Contoh: ahmadsyahril"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap & Gelar *</label>
              <Input
                type="text"
                placeholder="Contoh: Ahmad Syahril, S.Tr.Stat"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">NIP (Opsional)</label>
              <Input
                type="text"
                placeholder="Contoh: 199501012018011001"
                value={createForm.nip}
                onChange={(e) => setCreateForm({ ...createForm, nip: e.target.value })}
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Password Awal *</label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter..."
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Role Pengguna *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  <option value="PEGAWAI">Pegawai</option>
                  <option value="ADMIN_GUDANG">Admin Gudang</option>
                  <option value="SUPER_ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Seksi / Fungsi</label>
                <select
                  value={createForm.fungsiId}
                  onChange={(e) => setCreateForm({ ...createForm, fungsiId: e.target.value })}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  <option value="">Pilih Seksi...</option>
                  {fungsiList.map((f) => (
                    <option key={f.id} value={f.id}>{f.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#0F2F64] hover:bg-[#0A1F42] text-white">
                {submitting ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT PENGGUNA */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sky-600" />
              Edit Data Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Perbarui profil, NIP, atau role akun @{selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
              <Input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">NIP (Opsional)</label>
              <Input
                type="text"
                value={editForm.nip}
                onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Role Pengguna *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  <option value="PEGAWAI">Pegawai</option>
                  <option value="ADMIN_GUDANG">Admin Gudang</option>
                  <option value="SUPER_ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Seksi / Fungsi</label>
                <select
                  value={editForm.fungsiId}
                  onChange={(e) => setEditForm({ ...editForm, fungsiId: e.target.value })}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:bg-white"
                >
                  <option value="">Pilih Seksi...</option>
                  {fungsiList.map((f) => (
                    <option key={f.id} value={f.id}>{f.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#0284C7] hover:bg-[#0369A1] text-white">
                {submitting ? "Memperbarui..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: RESET PASSWORD */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Reset Kata Sandi
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Masukkan kata sandi baru untuk pengguna <strong>{selectedUser?.name}</strong> (@{selectedUser?.username}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Kata Sandi Baru *</label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 h-10 rounded-xl bg-slate-50"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                {submitting ? "Memproses..." : "Reset Password Sekarang"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: KONFIRMASI HAPUS PENGGUNA */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Konfirmasi Hapus Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong> (@{selectedUser?.username})?
              Tindakan ini tidak dapat dibatalkan.
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
              {submitting ? "Menghapus..." : "Ya, Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
