'use client';

import { useState } from "react";
import { createInstance } from "../../allapis";
import { Plus, CheckCircle, AlertCircle, Smartphone } from "lucide-react";

function getAdminToken(): string | null {
  try {
    const stored = localStorage.getItem("admin");
    if (!stored) return null;
    return JSON.parse(stored)?.adminToken || null;
  } catch {
    return null;
  }
}

export default function CreateInstancePage() {
  const [instanceName, setInstanceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = instanceName.trim();
    if (!trimmed) { setError("Instance name is required"); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError("Only letters, numbers, hyphens and underscores allowed");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Session expired. Please login again.");

      await createInstance(adminToken, trimmed);

      setSuccess(`Instance "${trimmed}" created! Go to Instances to connect it.`);
      setInstanceName("");

      // Trigger list refresh by dispatching a custom event
      window.dispatchEvent(new Event("instance-created"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create instance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Smartphone className="w-4 h-4" />
        <span>Each instance = one WhatsApp number</span>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Instance Name
          </label>
          <input
            type="text"
            value={instanceName}
            onChange={(e) => { setInstanceName(e.target.value); setError(null); setSuccess(null); }}
            placeholder="e.g. sales-bot, support-line"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-400"
          />
          <p className="mt-1.5 text-xs text-gray-400">Letters, numbers, hyphens and underscores only.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !instanceName.trim()}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Instance
            </>
          )}
        </button>
      </form>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Steps after creating</h3>
        <ol className="flex flex-col gap-2">
          {["Create instance", "Click instance to scan QR", "WhatsApp is now connected", "Use the API to send messages"].map((step, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
