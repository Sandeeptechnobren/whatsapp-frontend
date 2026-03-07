"use client";

import { useEffect, useState, useCallback } from "react";
import { saGetStats } from "../allapis";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { Users, Activity, DollarSign, Clock, ShieldCheck, ChevronRight, Wifi } from "lucide-react";

interface Stats {
  totalAdmins: number;
  totalInstances: number;
  activeInstances: number;
  pendingPayments: number;
  totalRevenue: string;
  instanceStatusBreakdown: { pending: number; ready: number; disconnected: number; error: number };
}

function StatCard({ label, value, icon, sub, color }: { label: string; value: string | number; icon: React.ReactNode; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function NavCard({ title, desc, href, badge, color }: { title: string; desc: string; href: string; badge?: string; color: string }) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(href)} className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-left flex items-center justify-between hover:border-purple-300 hover:shadow-md transition group">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>{badge}</span>}
        </div>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition" />
    </button>
  );
}

export default function SuperAdminDashboard() {
  const { isSuperAdmin, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) { router.push("/dashboard"); return; }
  }, [isSuperAdmin, router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await saGetStats(token);
      setStats(r.data);
    } catch { }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
            <p className="text-gray-500 text-sm">Monitor all users, instances, and payments.</p>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-2xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Admins"    value={stats.totalAdmins}    icon={<Users className="w-6 h-6 text-indigo-600" />}  color="bg-indigo-50" />
            <StatCard label="Total Instances" value={stats.totalInstances}  icon={<Activity className="w-6 h-6 text-green-600" />} color="bg-green-50" />
            <StatCard label="Connected Now"   value={stats.activeInstances} icon={<Wifi className="w-6 h-6 text-blue-600" />}    color="bg-blue-50" />
            <StatCard label="Pending Reviews" value={stats.pendingPayments} icon={<Clock className="w-6 h-6 text-yellow-600" />}  color="bg-yellow-50"
              sub={stats.pendingPayments > 0 ? "Action required" : undefined} />
          </div>
        )}

        {/* Revenue summary */}
        {stats && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Revenue</p>
              <p className="text-3xl font-extrabold mt-1">${stats.totalRevenue}</p>
              <p className="text-purple-200 text-xs mt-1">From all approved payments</p>
            </div>
            <DollarSign className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Instance breakdown */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Instance Status Breakdown</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Ready",        value: stats.instanceStatusBreakdown.ready,        cls: "bg-green-100 text-green-700" },
                { label: "Pending",      value: stats.instanceStatusBreakdown.pending,      cls: "bg-yellow-100 text-yellow-700" },
                { label: "Disconnected", value: stats.instanceStatusBreakdown.disconnected, cls: "bg-gray-100 text-gray-600" },
                { label: "Error",        value: stats.instanceStatusBreakdown.error,        cls: "bg-red-100 text-red-600" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.cls}`}>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-3">
          <NavCard title="Manage Admins"    desc="View, manage and delete admin accounts."       href="/superadmin/admins"    color="bg-indigo-100 text-indigo-700" />
          <NavCard title="All Instances"    desc="View instances across all admin accounts."      href="/superadmin/instances" color="bg-green-100 text-green-700" />
          <NavCard title="Payment Requests" desc="Approve or reject pending payment submissions." href="/superadmin/payments"
            badge={stats?.pendingPayments ? `${stats.pendingPayments} pending` : undefined}
            color="bg-yellow-100 text-yellow-700" />
        </div>
      </div>
    </div>
  );
}
