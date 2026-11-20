"use client";

import React, { useState, useEffect } from "react";
import { ScrollText, RefreshCw, Shield, Clock, User, Target } from "lucide-react";
import AdminTopbar from "./AdminTopbar";

interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  summary: string;
  timestamp: string;
}

export default function AdminAuditClient({ session }: { session: any }) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.note) setNote(data.note);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Audit Log Aktivitas"
        subtitle="Catatan riwayat tindakan keamanan, transaksi, dan perubahan konfigurasi sistem"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ffd731] text-black rounded-2xl ink-border shadow-[3px_3px_0px_#000000]">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
              Audit Log Aktivitas
            </h1>
            <p className="text-xs text-gray-500 font-bold">
              Catatan riwayat tindakan keamanan, transaksi, dan perubahan konfigurasi sistem.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1f1f2e] text-xs font-black text-carbon dark:text-white rounded-xl ink-border hover:bg-gray-50 shadow-[2px_2px_0px_#000000] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {note && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-200">
          ⚠️ {note}
        </div>
      )}

      {/* Table container */}
      <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000000] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-bold text-sm">
            Memuat catatan audit log...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-bold text-sm space-y-2">
            <Shield className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p>Belum ada catatan aktivitas di AuditLog.</p>
            <p className="text-xs text-gray-400">
              Setiap kali admin login, mengubah order, atau mengubah harga/pengaturan, log otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase text-gray-400">
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Pelaku (Actor)</th>
                  <th className="py-3 px-3">Aksi</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3">Ringkasan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1f1f2e]/50">
                    <td className="py-3 px-3 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-carbon dark:text-white">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px]">
                        <User className="w-3 h-3 text-gray-400" />
                        {item.actor}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.action}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Target className="w-3 h-3 text-gray-400" />
                        {item.target}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-200">
                      {item.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
