"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllInstances, requestPayment, getMyPayments } from "../allapis";
import { CreditCard, Clock, CheckCircle, XCircle, RefreshCw, Lock, AlertTriangle } from "lucide-react";

interface Instance {
  id: number;
  name: string;
  status: string;
  plan: string;
  trial_ends_at?: string;
  plan_expires_at?: string;
}

interface Payment {
  id: number;
  instance_id: number;
  instance_name: string;
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

function daysLeft(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function getJwt() { return localStorage.getItem("token") || ""; }
function getAdminToken() {
  try { return JSON.parse(localStorage.getItem("admin") || "")?.adminToken || ""; }
  catch { return ""; }
}

function PlanStatus({ instance }: { instance: Instance }) {
  if (instance.plan === "active" && instance.plan_expires_at && new Date(instance.plan_expires_at) > new Date()) {
    const d = daysLeft(instance.plan_expires_at);
    return <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold"><CreditCard className="w-3 h-3" /> Active — {d}d left</span>;
  }
  const d = daysLeft(instance.trial_ends_at);
  if (d !== null && d > 0)
    return <span className="flex items-center gap-1 text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-semibold"><Clock className="w-3 h-3" /> Trial — {d}d left</span>;
  return <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-semibold"><Lock className="w-3 h-3" /> Expired</span>;
}

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const map = {
    pending:  { cls: "bg-yellow-100 text-yellow-700", label: "Pending Review" },
    approved: { cls: "bg-green-100 text-green-700",   label: "Approved" },
    rejected: { cls: "bg-red-100 text-red-600",       label: "Rejected" },
  };
  const c = map[status];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.cls}`}>{c.label}</span>;
}

function PaymentModal({ instance, onClose, onSuccess }: {
  instance: Instance; onClose: () => void; onSuccess: () => void;
}) {
  const [method, setMethod]  = useState("bank_transfer");
  const [txId, setTxId]      = useState("");
  const [notes, setNotes]    = useState("");
  const [plan, setPlan]      = useState(30);
  const [loading, setLoading]= useState(false);
  const [error, setError]    = useState<string | null>(null);

  const prices: Record<number, number> = { 30: 9.99, 90: 24.99, 365: 79.99 };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError(null);
      await requestPayment(getJwt(), instance.id, {
        amount: prices[plan], currency: "USD", durationDays: plan,
        paymentMethod: method, transactionId: txId || undefined, notes: notes || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit payment");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Subscribe — {instance.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(prices).map(([days, price]) => (
                <button key={days} type="button" onClick={() => setPlan(Number(days))}
                  className={`p-3 rounded-xl border-2 text-center transition ${plan === Number(days) ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-bold text-gray-800">${price}</p>
                  <p className="text-xs text-gray-500">{days} days</p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">Payment Instructions</p>
            <p>Transfer <strong>${prices[plan]}</strong> then enter the transaction ID below. We will activate within 24 hours.</p>
            <p className="mt-1.5 text-xs text-blue-600 font-medium">Bank / UPI / PayPal: contact@chatterly.app</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Crypto</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID <span className="text-gray-400">(optional)</span></label>
            <input value={txId} onChange={e => setTxId(e.target.value)} placeholder="TXN123456..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional info..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-semibold rounded-xl transition">
            {loading ? "Submitting..." : `Submit Request — $${prices[plan]}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [instances, setInstances]   = useState<Instance[]>([]);
  const [payments, setPayments]     = useState<Payment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeModal, setActiveModal] = useState<Instance | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, payRes] = await Promise.all([getAllInstances(getAdminToken()), getMyPayments(getJwt())]);
      setInstances(instRes.data || []);
      setPayments(payRes.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSuccess = () => {
    setActiveModal(null);
    setSuccessMsg("Payment submitted! We will review and activate your instance within 24 hours.");
    load();
    setTimeout(() => setSuccessMsg(null), 8000);
  };

  const planCards = [
    { name: "Monthly",   price: "$9.99",  period: "/month",  days: 30,  popular: false },
    { name: "Quarterly", price: "$24.99", period: "/3 months", days: 90, popular: true },
    { name: "Annual",    price: "$79.99", period: "/year",   days: 365, popular: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 text-sm mt-0.5">Each instance requires a separate subscription. 6-day free trial included.</p>
        </div>

        {successMsg && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {planCards.map((p) => (
            <div key={p.name} className={`bg-white rounded-2xl border-2 p-5 relative ${p.popular ? "border-green-500 shadow-lg" : "border-gray-200"}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-green-500 rounded-full px-3 py-1">Most Popular</div>}
              <h3 className="font-bold text-gray-800">{p.name}</h3>
              <p className="mt-2"><span className="text-3xl font-extrabold text-gray-900">{p.price}</span><span className="text-gray-400 text-sm">{p.period}</span></p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                {["Unlimited Messages", "Webhook Support", "REST API Access", "All WhatsApp Features"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Instances */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700">Your Instances</h2>
            <button onClick={load} disabled={loading} className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 animate-pulse bg-gray-100 rounded-xl" />)}</div>
          ) : instances.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 text-gray-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No instances yet.</p>
            </div>
          ) : instances.map(inst => {
            const isExpired = !(
              (inst.plan === "active" && inst.plan_expires_at && new Date(inst.plan_expires_at) > new Date()) ||
              (inst.trial_ends_at && new Date(inst.trial_ends_at) > new Date())
            );
            return (
              <div key={inst.id} className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 mb-2 ${isExpired ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${inst.status === "ready" ? "bg-green-500" : "bg-gray-400"}`}>
                    {inst.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{inst.name}</p>
                    <PlanStatus instance={inst} />
                  </div>
                </div>
                <button onClick={() => setActiveModal(inst)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition flex-shrink-0">
                  <CreditCard className="w-3.5 h-3.5" /> {isExpired ? "Resubscribe" : "Extend"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Payment History</h2>
          {payments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 text-gray-400">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No payments yet.</p>
            </div>
          ) : payments.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{p.instance_name}</p>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-gray-500">{p.payment_method} • {p.duration_days} days • ${p.amount}</p>
                  {p.transaction_id && <p className="text-xs text-gray-400 font-mono mt-0.5">TXN: {p.transaction_id}</p>}
                  {p.status === "approved" && <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved {new Date(p.approved_at!).toLocaleDateString()}</p>}
                  {p.status === "rejected" && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</p>}
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {activeModal && <PaymentModal instance={activeModal} onClose={() => setActiveModal(null)} onSuccess={onSuccess} />}
    </div>
  );
}
