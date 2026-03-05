"use client";

import React, { useCallback, useEffect, useState } from "react";
import { instancesStatistics } from "../allapis";
import { Wifi, WifiOff, Clock, AlertTriangle, Activity, RefreshCw, Copy, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatusBreakdown {
  pending: number;
  ready: number;
  disconnected: number;
  error: number;
}

interface Stats {
  totalInstances: number;
  statusBreakdown: StatusBreakdown;
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ApiTokenCard() {
  const [copied, setCopied] = useState(false);
  const [adminToken, setAdminToken] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin");
      if (stored) setAdminToken(JSON.parse(stored)?.adminToken || "");
    } catch {}
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(adminToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs">K</span>
        Your API Token
      </h3>
      <p className="text-xs text-gray-400 mb-2">Use this token in API calls that require authentication.</p>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <code className="text-xs text-gray-600 font-mono flex-1 truncate">{adminToken || "—"}</code>
        <button onClick={copy} className="p-1 rounded text-gray-400 hover:text-purple-600 transition flex-shrink-0">
          {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function QuickStartCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Start</h3>
      <ol className="space-y-2.5">
        {[
          { step: "1", label: "Create an Instance", sub: "Go to Instances → New Instance" },
          { step: "2", label: "Scan QR Code",       sub: "Click the instance to connect WhatsApp" },
          { step: "3", label: "Set Webhook (optional)", sub: "Receive incoming messages to your server" },
          { step: "4", label: "Send Messages",      sub: "Use the Send tab or REST API" },
        ].map(({ step, label, sub }) => (
          <li key={step} className="flex items-start gap-3">
            <span className="w-5 h-5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              {step}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalInstances: 0,
    statusBreakdown: { pending: 0, ready: 0, disconnected: 0, error: 0 },
  });
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin");
      if (stored) setAdminName(JSON.parse(stored)?.name || JSON.parse(stored)?.username || "");
    } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await instancesStatistics(token);
      const payload = data.data ?? data;
      if (payload && payload.totalInstances !== undefined) {
        setStats(payload);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {adminName ? `Welcome, ${adminName}` : "Dashboard"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Monitor your WhatsApp instances and API usage.</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-200 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Instances"
            value={stats.totalInstances}
            icon={<Activity className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-50"
          />
          <StatCard
            label="Connected"
            value={stats.statusBreakdown.ready}
            icon={<Wifi className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Pending QR"
            value={stats.statusBreakdown.pending}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            label="Disconnected"
            value={stats.statusBreakdown.disconnected + stats.statusBreakdown.error}
            icon={<WifiOff className="w-6 h-6 text-gray-500" />}
            color="bg-gray-100"
          />
        </div>

        {/* Alert if no instances */}
        {stats.totalInstances === 0 && !loading && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">No instances yet</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Create your first WhatsApp instance to get started.{" "}
                <button onClick={() => router.push("/instances")} className="underline font-medium">
                  Go to Instances →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Two-column bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ApiTokenCard />
          <QuickStartCard />
        </div>

        {/* Manage Instances CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">Manage Instances</p>
            <p className="text-green-100 text-sm mt-0.5">Create, connect and send messages via your WhatsApp instances.</p>
          </div>
          <button
            onClick={() => router.push("/instances")}
            className="px-4 py-2 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition text-sm flex-shrink-0"
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  );
}
