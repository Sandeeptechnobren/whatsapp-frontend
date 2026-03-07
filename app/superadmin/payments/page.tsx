"use client";

import { useEffect, useState, useCallback } from "react";
import { saGetPayments, saApprovePayment, saRejectPayment } from "../../allapis";
import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface Payment {
  id: number;
  instance_name: string;
  admin_username: string;
  admin_email: string;
  amount: number;
  currency: string;
  duration_days: number;
  status: "pending" | "approved" | "rejected";
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  approved_at?: string;
}

function Badge({ status }: { status: Payment["status"] }) {
  const m = {
    pending:  { cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" />,        label: "Pending" },
    approved: { cls: "bg-green-100 text-green-700",   icon: <CheckCircle className="w-3 h-3" />,  label: "Approved" },
    rejected: { cls: "bg-red-100 text-red-600",       icon: <XCircle className="w-3 h-3" />,      label: "Rejected" },
  };
  const c = m[status];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>{c.icon}{c.label}</span>;
}

export default function SuperAdminPayments() {
  const { isSuperAdmin, token } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { if (!isSuperAdmin) router.push("/dashboard"); }, [isSuperAdmin]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await saGetPayments(token, filter || undefined);
      setPayments(r.data || []);
    } catch { } finally { setLoading(false); }
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: number) => {
    if (!confirm("Approve this payment? This will unlock the instance.")) return;
    try { setActionId(id); await saApprovePayment(token!, id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setActionId(null); }
  };

  const reject = async () => {
    if (!rejectId) return;
    try { setActionId(rejectId); await saRejectPayment(token!, rejectId, rejectReason); setRejectId(null); setRejectReason(""); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setActionId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        <button onClick={() => router.push("/superadmin")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Super Admin
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Payment Requests</h1>
          <button onClick={load} disabled={loading} className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["pending","approved","rejected",""].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${filter === f ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}>
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-xl" />)}</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No {filter || ""} payments found.</p>
          </div>
        ) : payments.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className="font-semibold text-gray-800">{p.instance_name}</h3>
                  <Badge status={p.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span><strong>Admin:</strong> {p.admin_username}</span>
                  <span><strong>Amount:</strong> ${p.amount} {p.currency}</span>
                  <span><strong>Plan:</strong> {p.duration_days} days</span>
                  <span><strong>Method:</strong> {p.payment_method}</span>
                  {p.transaction_id && <span className="col-span-2 font-mono"><strong>TXN:</strong> {p.transaction_id}</span>}
                  {p.notes && <span className="col-span-2"><strong>Notes:</strong> {p.notes}</span>}
                  <span><strong>Date:</strong> {new Date(p.created_at).toLocaleDateString()}</span>
                  {p.approved_at && <span><strong>Approved:</strong> {new Date(p.approved_at).toLocaleDateString()}</span>}
                </div>
              </div>
              {p.status === "pending" && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => approve(p.id)} disabled={actionId === p.id} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => { setRejectId(p.id); setRejectReason(""); }} disabled={actionId === p.id} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h2 className="font-bold text-gray-800 mb-3">Reject Payment</h2>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setRejectId(null)} className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={reject} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
