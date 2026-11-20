"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, RefreshCw, Shield, Key } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminPenggunaClient({ session }: { session: any }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    role: "ADMIN",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isOwner = session.role === "OWNER";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setShowModal(false);
        setForm({ username: "", name: "", password: "", role: "ADMIN" });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menambah admin." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ffd731] text-black rounded-2xl ink-border shadow-[3px_3px_0px_#000000]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
              Manajemen Pengguna Admin
            </h1>
            <p className="text-xs text-gray-500 font-bold">
              Kelola daftar akun pengelola dashboard dengan role berbasis izin (RBAC).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1f1f2e] text-xs font-black text-carbon dark:text-white rounded-xl ink-border shadow-[2px_2px_0px_#000000]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </button>
          {isOwner && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-xs font-black rounded-xl ink-border shadow-[2px_2px_0px_#000000] hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Admin
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border-2 ${
            message.type === "success"
              ? "bg-green-50 border-green-500 text-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "bg-red-50 border-red-500 text-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase text-gray-400">
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Nama Lengkap</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1f1f2e]/50">
                  <td className="py-3 px-3 font-mono font-bold text-carbon dark:text-white">
                    @{u.username}
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-800 dark:text-gray-200">
                    {u.name}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        u.role === "OWNER"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-6 max-w-md w-full shadow-[6px_6px_0px_#000000] space-y-4">
            <h3 className="text-base font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
              Tambah Pengguna Admin Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  Username Admin
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="admin_baru"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-mono lowercase"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Staf"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  Password Sementara (disimpan dengan scrypt)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  Peran (Role)
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-bold"
                >
                  <option value="ADMIN">ADMIN (Operasional Standar)</option>
                  <option value="VIEWER">VIEWER (Hanya Lihat / Read-Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-carbon dark:text-white rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#ffd731] text-black font-black ink-border rounded-xl shadow-[2px_2px_0px_#000000]"
                >
                  {submitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
