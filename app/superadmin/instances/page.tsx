"use client";

import { useEffect, useState, useCallback } from "react";
import { saGetInstances, saLockInstance, saUnlockInstance } from "../../allapis";
import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Unlock, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

interface Instance {
  id: number;
  name: string;
  status: string;
  plan: string;
  trial_ends_at?: string;
  plan_expires_at?: string;
  admin_username: string;
  admin_email: string;
  last_seen?: string;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { cls: string; label: string }> = {
    ready:        { cls: "bg-green-100 text-green-700",  label: "Connected" },
    pending:      { cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
    disconnected: { cls: "bg-gray-100 text-gray-500",    label: "Offline" },
    error:        { cls: "bg-red-100 text-red-600",      label: "Error" },
  };
  const c = m[status] || m.disconnected;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.cls}`}>{c.label}</span>;
}

function PlanBadge({ instance }: { instance: Instance }) {
  if (instance.plan === "active" && instance.plan_expires_at && new Date(instance.plan_expires_at) > new Date())
    return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">Active</span>;
  if (instance.trial_ends_at && new Date(instance.trial_ends_at) > new Date())
    return <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">Trial</span>;
  return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">Expired</span>;
}

export default function SuperAdminInstances() {
  const { isSuperAdmin, token } = useAuth();
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [unlockDays, setUnlockDays] = useState(30);
  const [search, setSearch] = useState("");

  useEffect(() => { if (!isSuperAdmin) router.push("/dashboard"); }, [isSuperAdmin]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await saGetInstances(token); setInstances(r.data || []); }
    catch { } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const lock = async (id: number) => {
    if (!confirm("Lock this instance?")) return;
    try { setActionId(id); await saLockInstance(token!, id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setActionId(null); }
  };

  const unlock = async (id: number) => {
    try { setActionId(id); await saUnlockInstance(token!, id, unlockDays); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setActionId(null); }
  };

  const filtered = instances.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.admin_username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <button onClick={() => router.push("/superadmin")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Super Admin
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-gray-900">All Instances ({instances.length})</h1>
          <div className="flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or admin..." className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button onClick={load} disabled={loading} className="p-1.5 text-gray-400 hover:text-green-600 transition"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <label className="font-medium">Unlock duration:</label>
          <select value={unlockDays} onChange={e => setUnlockDays(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none">
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>365 days</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse bg-gray-100 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">No instances found.</div>
        ) : filtered.map(inst => (
          <div key={inst.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${inst.status === "ready" ? "bg-green-500" : "bg-gray-400"}`}>
                  {inst.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{inst.name}</h3>
                    <StatusBadge status={inst.status} />
                    <PlanBadge instance={inst} />
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p><strong>Admin:</strong> {inst.admin_username} ({inst.admin_email})</p>
                    <p><strong>Created:</strong> {new Date(inst.created_at).toLocaleDateString()}</p>
                    {inst.trial_ends_at && <p><strong>Trial ends:</strong> {new Date(inst.trial_ends_at).toLocaleDateString()}</p>}
                    {inst.plan_expires_at && <p><strong>Plan expires:</strong> {new Date(inst.plan_expires_at).toLocaleDateString()}</p>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => unlock(inst.id)} disabled={actionId === inst.id} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition">
                  <Unlock className="w-3.5 h-3.5" /> Unlock {unlockDays}d
                </button>
                <button onClick={() => lock(inst.id)} disabled={actionId === inst.id} className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-semibold rounded-lg transition">
                  <Lock className="w-3.5 h-3.5" /> Lock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
