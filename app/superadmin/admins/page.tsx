"use client";

import { useEffect, useState, useCallback } from "react";
import { saGetAdmins, saDeleteAdmin } from "../../allapis";
import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RefreshCw, Users, Copy, CheckCheck } from "lucide-react";

interface Admin {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  token: string;
  instance_count: number;
  created_at: string;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button onClick={copy} className="p-1 text-gray-400 hover:text-purple-600 transition">
      {ok ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function SuperAdminAdmins() {
  const { isSuperAdmin, token } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!isSuperAdmin) router.push("/dashboard"); }, [isSuperAdmin, router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await saGetAdmins(token); setAdmins(r.data || []); }
    catch { } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const deleteAdmin = async (id: number, username: string) => {
    if (!confirm(`Delete admin "${username}"? All their instances will also be deleted.`)) return;
    try {
      setDeleting(id);
      await saDeleteAdmin(token!, id);
      load();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setDeleting(null); }
  };

  const filtered = admins.filter(a =>
    !search || a.username.toLowerCase().includes(search.toLowerCase()) || (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <button onClick={() => router.push("/superadmin")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Super Admin
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-gray-900">Admin Accounts ({admins.length})</h1>
          <div className="flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username or email..." className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button onClick={load} disabled={loading} className="p-1.5 text-gray-400 hover:text-green-600 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No admins found.</p>
          </div>
        ) : filtered.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {a.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-800">{a.username}</h3>
                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">{a.role}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{a.instance_count} instance{a.instance_count !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-sm text-gray-600">{a.name}</p>
                  <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                    {a.email && <p>{a.email}</p>}
                    {a.phone && <p>{a.phone}</p>}
                    <p>Joined {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 bg-gray-50 border border-gray-200 rounded px-2 py-1 max-w-xs">
                    <code className="text-xs text-gray-500 font-mono flex-1 truncate">{a.token}</code>
                    <CopyBtn text={a.token} />
                  </div>
                </div>
              </div>
              <button onClick={() => deleteAdmin(a.id, a.username)} disabled={deleting === a.id} className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-semibold rounded-lg transition flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
