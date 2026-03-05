'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getAllInstances, sendMessage, sendMedia, setWebhook,
  deleteInstance, logoutInstance, getChats, getChatMessages,
  getContacts, checkNumber, getGroups, createGroup,
  getAccountInfo, getProfilePic, reactToMessage,
} from "../../allapis";
import {
  ArrowLeft, Copy, CheckCheck, Send, Globe, Trash2, LogOut,
  Wifi, WifiOff, Clock, RefreshCw, AlertTriangle, MessageSquare,
  Users, Phone, Image, MapPin, ChevronRight, Lock, CreditCard,
} from "lucide-react";

/* ================================================================== */
/*  Types                                                               */
/* ================================================================== */
interface Instance {
  id: number;
  name: string;
  token: string;
  status: string;
  uuid?: string;
  trial_ends_at?: string;
  plan?: string;
  plan_expires_at?: string;
}

type Tab = "send" | "media" | "chats" | "contacts" | "groups" | "webhook" | "settings";

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */
function getAdminToken() {
  try { return JSON.parse(localStorage.getItem("admin") || "")?.adminToken || null; }
  catch { return null; }
}
function getJwt() { return localStorage.getItem("token"); }

function daysLeft(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/* ================================================================== */
/*  Sub-components                                                      */
/* ================================================================== */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ready:        { cls: "bg-green-100 text-green-700",  label: "Connected" },
    pending:      { cls: "bg-yellow-100 text-yellow-700", label: "Pending QR" },
    disconnected: { cls: "bg-gray-100 text-gray-500",    label: "Disconnected" },
    error:        { cls: "bg-red-100 text-red-600",      label: "Error" },
  };
  const c = map[status] || map.disconnected;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.cls}`}>{c.label}</span>;
}

function PlanBadge({ instance }: { instance: Instance }) {
  const days = instance.plan === "active"
    ? daysLeft(instance.plan_expires_at)
    : daysLeft(instance.trial_ends_at);

  if (instance.plan === "active") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"><CreditCard className="w-3 h-3" /> Active — {days}d left</span>;
  }
  if (days !== null && days > 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"><Clock className="w-3 h-3" /> Trial — {days}d left</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><Lock className="w-3 h-3" /> Locked</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button onClick={copy} className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition">
      {ok ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function Alert({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <div className={`text-sm px-3 py-2.5 rounded-lg border ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {msg}
    </div>
  );
}

function Spinner() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>;
}

/* ================================================================== */
/*  Tab: Send Text                                                      */
/* ================================================================== */
function SendTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setResult(null);
      const t = getAdminToken()!;
      await sendMessage(t, instanceName, phone.trim(), msg.trim());
      setResult({ ok: true, msg: "Message sent!" });
      setMsg("");
    } catch (err: unknown) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {!isReady && <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">Instance must be connected to send messages.</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="919876543210 (with country code)" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" disabled={!isReady} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Type your message..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" disabled={!isReady} />
      </div>
      {result && <Alert ok={result.ok} msg={result.msg} />}
      <button type="submit" disabled={loading || !phone.trim() || !msg.trim() || !isReady} className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition text-sm">
        {loading ? <Spinner /> : <Send className="w-4 h-4" />} {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

/* ================================================================== */
/*  Tab: Send Media                                                     */
/* ================================================================== */
function MediaTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [phone, setPhone] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true); setResult(null);
      const t = getAdminToken()!;
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      await sendMedia(t, instanceName, phone.trim(), base64, file.type, file.name, caption);
      setResult({ ok: true, msg: "Media sent!" });
      setFile(null); setCaption("");
    } catch (err: unknown) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {!isReady && <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">Instance must be connected.</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="919876543210" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" disabled={!isReady} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File (image / video / document)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-400 transition cursor-pointer" onClick={() => document.getElementById("file-input")?.click()}>
          {file ? <p className="text-sm text-green-700 font-medium">{file.name}</p> : <><Image className="w-8 h-8 text-gray-300 mx-auto mb-1" /><p className="text-sm text-gray-400">Click to select file</p></>}
          <input id="file-input" type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} disabled={!isReady} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" disabled={!isReady} />
      </div>
      {result && <Alert ok={result.ok} msg={result.msg} />}
      <button type="submit" disabled={loading || !phone.trim() || !file || !isReady} className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition text-sm">
        {loading ? <Spinner /> : <Image className="w-4 h-4" />} {loading ? "Sending..." : "Send Media"}
      </button>
    </form>
  );
}

/* ================================================================== */
/*  Tab: Chats                                                          */
/* ================================================================== */
function ChatsTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const load = async () => {
    try { setLoading(true); const r = await getChats(getAdminToken()!, instanceName); setChats(r.data || []); }
    catch { } finally { setLoading(false); }
  };

  const loadMessages = async (chat: any) => {
    setSelected(chat); setMessages([]);
    try {
      setMsgLoading(true);
      const r = await getChatMessages(getAdminToken()!, instanceName, chat.id);
      setMessages(r.data || []);
    } catch { } finally { setMsgLoading(false); }
  };

  if (!isReady) return <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">Instance must be connected.</div>;

  return (
    <div className="space-y-3">
      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
        {loading ? <Spinner /> : <RefreshCw className="w-3.5 h-3.5" />} Load Chats
      </button>
      {selected && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b">
            <span className="font-medium text-sm">{selected.name}</span>
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {msgLoading ? <div className="flex justify-center py-4"><Spinner /></div> :
              messages.map((m, i) => (
                <div key={i} className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.fromMe ? "bg-green-100 text-green-900 ml-auto" : "bg-gray-100 text-gray-800"}`}>
                  {m.body || <span className="italic text-gray-400">[{m.type}]</span>}
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(m.timestamp * 1000).toLocaleTimeString()}</div>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {chats.map(c => (
          <button key={c.id} onClick={() => loadMessages(c)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${c.isGroup ? "bg-blue-500" : "bg-green-500"}`}>
              {c.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 truncate">{c.lastMessage?.body || "No messages"}</p>
            </div>
            {c.unreadCount > 0 && <span className="w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{c.unreadCount}</span>}
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Contacts                                                       */
/* ================================================================== */
function ContactsTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkNum, setCheckNum] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const load = async () => {
    try { setLoading(true); const r = await getContacts(getAdminToken()!, instanceName); setContacts(r.data || []); }
    catch { } finally { setLoading(false); }
  };

  const doCheck = async () => {
    try {
      const r = await checkNumber(getAdminToken()!, instanceName, checkNum.trim());
      setCheckResult(r.isRegistered ? `${checkNum} is on WhatsApp` : `${checkNum} is NOT on WhatsApp`);
    } catch (err: unknown) { setCheckResult(err instanceof Error ? err.message : "Error"); }
  };

  if (!isReady) return <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">Instance must be connected.</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={checkNum} onChange={e => setCheckNum(e.target.value)} placeholder="Check number (919876543210)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={doCheck} disabled={!checkNum.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">Check</button>
      </div>
      {checkResult && <p className={`text-sm px-3 py-2 rounded-lg ${checkResult.includes("NOT") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{checkResult}</p>}

      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
        {loading ? <Spinner /> : <Phone className="w-3.5 h-3.5" />} Load Contacts
      </button>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {contacts.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
              {c.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">+{c.number}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Groups                                                         */
/* ================================================================== */
function GroupsTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParticipants, setNewParticipants] = useState("");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = async () => {
    try { setLoading(true); const r = await getGroups(getAdminToken()!, instanceName); setGroups(r.data || []); }
    catch { } finally { setLoading(false); }
  };

  const doCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true); setResult(null);
      const parts = newParticipants.split(",").map(p => p.trim()).filter(Boolean);
      await createGroup(getAdminToken()!, instanceName, newName, parts);
      setResult({ ok: true, msg: "Group created!" });
      setNewName(""); setNewParticipants("");
      load();
    } catch (err: unknown) { setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" }); }
    finally { setCreating(false); }
  };

  if (!isReady) return <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">Instance must be connected.</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={doCreate} className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">Create New Group</p>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input value={newParticipants} onChange={e => setNewParticipants(e.target.value)} placeholder="Numbers comma-separated: 9198..., 9187..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        {result && <Alert ok={result.ok} msg={result.msg} />}
        <button type="submit" disabled={creating || !newName} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition">
          {creating ? <Spinner /> : <Users className="w-3.5 h-3.5" />} Create Group
        </button>
      </form>

      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
        {loading ? <Spinner /> : <RefreshCw className="w-3.5 h-3.5" />} Load Groups
      </button>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {groups.map(g => (
          <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">G</div>
            <div>
              <p className="text-sm font-medium text-gray-800">{g.name}</p>
              <p className="text-xs text-gray-400">{g.participantCount} members</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Webhook                                                        */
/* ================================================================== */
function WebhookTab({ instanceName, instance }: { instanceName: string; instance: Instance }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setResult(null);
      await setWebhook(getAdminToken()!, instanceName, url.trim());
      setResult({ ok: true, msg: "Webhook saved!" });
    } catch (err: unknown) { setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <p className="font-semibold mb-1">Incoming Message Forwarding</p>
        <p>When a message arrives on this WhatsApp number, we POST the data to your webhook URL in real-time.</p>
      </div>
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        {result && <Alert ok={result.ok} msg={result.msg} />}
        <button type="submit" disabled={loading || !url.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition">
          {loading ? <Spinner /> : <Globe className="w-4 h-4" />} Save Webhook
        </button>
      </form>
      <div className="bg-gray-50 rounded-xl p-3 border">
        <p className="text-xs font-semibold text-gray-500 mb-2">Payload Example</p>
        <pre className="text-xs text-gray-600 font-mono overflow-x-auto">{`{
  "event": "message",
  "instance": "${instanceName}",
  "data": {
    "from": "919876543210@c.us",
    "body": "Hello!",
    "type": "chat",
    "timestamp": 1234567890,
    "isGroup": false
  }
}`}</pre>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Settings                                                       */
/* ================================================================== */
function SettingsTab({ instance, instanceName }: { instance: Instance; instanceName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const doLogout = async () => {
    if (!confirm(`Disconnect WhatsApp from "${instanceName}"?`)) return;
    try {
      setLoading(true); setResult(null);
      await logoutInstance(getAdminToken()!, instanceName);
      setResult({ ok: true, msg: "Disconnected. Redirecting..." });
      setTimeout(() => router.push("/instances"), 1500);
    } catch (err: unknown) { setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" }); }
    finally { setLoading(false); }
  };

  const doDelete = async () => {
    if (!confirm(`Permanently delete "${instanceName}"?`)) return;
    try {
      setLoading(true); setResult(null);
      await deleteInstance(getAdminToken()!, instanceName);
      setResult({ ok: true, msg: "Deleted. Redirecting..." });
      setTimeout(() => router.push("/instances"), 1500);
    } catch (err: unknown) { setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {result && <Alert ok={result.ok} msg={result.msg} />}

      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-800">Disconnect</h3>
          <p className="text-sm text-gray-500 mt-0.5">Logs out WhatsApp. You can reconnect by scanning QR again.</p>
        </div>
        <button onClick={doLogout} disabled={loading || instance.status !== "ready"} className="flex items-center gap-2 px-4 py-2 border border-yellow-400 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 rounded-lg text-sm font-medium transition">
          <LogOut className="w-4 h-4" /> Disconnect WhatsApp
        </button>
      </div>

      <div className="border border-red-200 rounded-xl p-4 space-y-3 bg-red-50/30">
        <div>
          <h3 className="font-semibold text-red-700">Danger Zone</h3>
          <p className="text-sm text-red-500 mt-0.5">Permanently deletes this instance. Cannot be undone.</p>
        </div>
        <button onClick={doDelete} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
          <Trash2 className="w-4 h-4" /> Delete Instance
        </button>
      </div>

      {/* API quick reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">API Reference</p>
        {[
          ["POST", `instance/send/${instanceName}`, "Send text message"],
          ["POST", `instance/send-media/${instanceName}`, "Send image/file"],
          ["POST", `instance/chats/${instanceName}`, "Get all chats"],
          ["POST", `instance/contacts/${instanceName}`, "Get contacts"],
          ["POST", `instance/groups/${instanceName}`, "Get groups"],
          ["POST", `instance/check-number/${instanceName}`, "Check number"],
          ["POST", `instance/webhook/${instanceName}`, "Set webhook"],
        ].map(([m, p, d]) => (
          <div key={p} className="flex items-center gap-2 text-xs py-1">
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded font-mono">{m}</span>
            <code className="text-gray-500 flex-1 truncate font-mono">/{p}</code>
            <span className="text-gray-400 hidden sm:block flex-shrink-0">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                           */
/* ================================================================== */
export default function InstanceDetails() {
  const params       = useParams();
  const router       = useRouter();
  const instanceName = typeof params?.id === "string" ? params.id : "";

  const [instance, setInstance]   = useState<Instance | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("send");

  const loadInstance = useCallback(async () => {
    try {
      setLoading(true);
      const t = getAdminToken();
      if (!t) { router.push("/auth/login"); return; }
      const r = await getAllInstances(t);
      const found = (r.data || []).find((i: Instance) => i.name === instanceName);
      if (!found) { setNotFound(true); return; }
      setInstance(found);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [instanceName]);

  useEffect(() => { loadInstance(); }, [loadInstance]);

  const isExpired = () => {
    if (!instance) return false;
    if (instance.plan === "active" && instance.plan_expires_at && new Date(instance.plan_expires_at) > new Date()) return false;
    if (instance.trial_ends_at && new Date(instance.trial_ends_at) > new Date()) return false;
    return true;
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-100 border-t-green-500 rounded-full animate-spin" /></div>;

  if (notFound || !instance) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle className="w-12 h-12 text-yellow-400 mb-3" />
      <h2 className="text-xl font-bold text-gray-700 mb-1">Instance not found</h2>
      <button onClick={() => router.push("/instances")} className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition">Back to Instances</button>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "send",     label: "Send Text",  icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "media",    label: "Media",      icon: <Image className="w-3.5 h-3.5" /> },
    { id: "chats",    label: "Chats",      icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "contacts", label: "Contacts",   icon: <Phone className="w-3.5 h-3.5" /> },
    { id: "groups",   label: "Groups",     icon: <Users className="w-3.5 h-3.5" /> },
    { id: "webhook",  label: "Webhook",    icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Settings",   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  const isReady = instance.status === "ready";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">

        <button onClick={() => router.push("/instances")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Instances
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-5 py-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold mb-1.5">{instance.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={instance.status} />
                  <PlanBadge instance={instance} />
                </div>
              </div>
              <button onClick={loadInstance} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Token */}
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Instance Token</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <code className="text-xs text-gray-600 font-mono flex-1 truncate">{instance.token}</code>
              <CopyBtn text={instance.token} />
            </div>
          </div>

          {/* Not connected */}
          {!isReady && (
            <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-800">Not Connected</p>
                <p className="text-xs text-yellow-600">Scan the QR code to activate this instance.</p>
              </div>
              <button onClick={() => router.push(`/instances/${instance.name}/activate`)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition">Connect</button>
            </div>
          )}

          {/* Expired */}
          {isExpired() && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5"><Lock className="w-4 h-4" /> Trial Expired</p>
                <p className="text-xs text-red-500">Subscribe to continue using this instance.</p>
              </div>
              <button onClick={() => router.push("/billing_subscription")} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">Subscribe</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition flex-shrink-0 ${activeTab === tab.id ? "text-green-600 border-green-600 bg-green-50/50" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "send"     && <SendTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "media"    && <MediaTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "chats"    && <ChatsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "contacts" && <ContactsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "groups"   && <GroupsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "webhook"  && <WebhookTab instanceName={instance.name} instance={instance} />}
            {activeTab === "settings" && <SettingsTab instance={instance} instanceName={instance.name} />}
          </div>
        </div>
      </div>
    </div>
  );
}
