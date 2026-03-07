'use client';

import { useEffect, useState } from "react";
import { getAllInstances } from "../../allapis";
import { useRouter } from "next/navigation";
import { RefreshCw, Wifi, WifiOff, Clock, Plus, ChevronRight } from "lucide-react";

interface Instance {
  id: number;
  name: string;
  token: string;
  status: string;
  uuid?: string;
}

function getAdminToken(): string | null {
  try {
    const stored = localStorage.getItem("admin");
    if (!stored) return null;
    return JSON.parse(stored)?.adminToken || null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    ready:        { bg: "bg-green-100 text-green-700 border border-green-200",   text: "Connected",    icon: <Wifi className="w-3 h-3" /> },
    pending:      { bg: "bg-yellow-100 text-yellow-700 border border-yellow-200", text: "Pending QR",  icon: <Clock className="w-3 h-3" /> },
    disconnected: { bg: "bg-gray-100 text-gray-600 border border-gray-200",       text: "Disconnected", icon: <WifiOff className="w-3 h-3" /> },
    error:        { bg: "bg-red-100 text-red-700 border border-red-200",          text: "Error",       icon: <WifiOff className="w-3 h-3" /> },
  };
  const c = cfg[status] || cfg.disconnected;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg}`}>
      {c.icon} {c.text}
    </span>
  );
}

export default function InstancesList() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { fetchInstances(); }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Unauthorized. Please login again.");
      const response = await getAllInstances(adminToken);
      setInstances(response.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch instances");
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceClick = (instance: Instance) => {
    if (instance.status === "pending") {
      router.push(`/instances/${instance.name}/activate`);
    } else {
      router.push(`/instances/${instance.name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button onClick={fetchInstances} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
          Retry
        </button>
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plus className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-medium">No instances yet</p>
        <p className="text-sm mt-1">Create your first WhatsApp instance to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-500">{instances.length} instance{instances.length !== 1 ? "s" : ""}</span>
        <button
          onClick={fetchInstances}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {instances.map((instance) => (
        <button
          key={instance.id}
          onClick={() => handleInstanceClick(instance)}
          className="w-full text-left flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
              instance.status === "ready" ? "bg-green-500" :
              instance.status === "pending" ? "bg-yellow-500" : "bg-gray-400"
            }`}>
              {instance.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{instance.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[160px]">{instance.token}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={instance.status} />
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition" />
          </div>
        </button>
      ))}
    </div>
  );
}
