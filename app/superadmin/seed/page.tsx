"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../allapis";

export default function SeedSuperAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", name: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE_URL}superadmin/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, name: form.name, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create super admin");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Super Admin Created</h1>
          <p className="text-sm text-gray-500 mb-6">You can now log in with your super admin credentials.</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Create Super Admin</h1>
            <p className="text-xs text-gray-500">One-time setup for platform management</p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>This endpoint is public and should be used only once. Remove or disable it after initial setup.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={form.username}
              onChange={e => setForm(v => ({ ...v, username: e.target.value }))}
              required
              placeholder="superadmin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
              required
              placeholder="Super Admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
              required
              placeholder="Min 8 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm(v => ({ ...v, confirm: e.target.value }))}
              required
              placeholder="Repeat password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition"
          >
            {loading ? "Creating..." : "Create Super Admin"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} className="text-purple-600 hover:underline">Login</button>
        </p>
      </div>
    </div>
  );
}
