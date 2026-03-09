'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getAllInstances, getInstanceStatus, sendMessage, sendMedia, setWebhook,
  deleteInstance, logoutInstance, getChats, getChatMessages,
  getContacts, checkNumber, getGroups, createGroup,
  getAutoReplySettings, updateAutoReplySettings,
} from "../../allapis";
import {
  ArrowLeft, Copy, CheckCheck, Send, Globe, Trash2, LogOut,
  Clock, RefreshCw, AlertTriangle, MessageSquare,
  Users, Phone, Image as ImageIcon, ChevronRight, Lock, CreditCard,
  Bot, Zap, Settings2,
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

type Tab = "send" | "media" | "chats" | "contacts" | "groups" | "webhook" | "autoreply" | "settings";

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage?: { body: string };
}

interface ChatMessage {
  id: string;
  body: string;
  type: string;
  fromMe: boolean;
  timestamp: number;
}

interface Contact {
  id: string;
  name: string;
  number: string;
}

interface Group {
  id: string;
  name: string;
  participantCount: number;
}

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */
function getAdminToken() {
  try { return JSON.parse(localStorage.getItem("admin") || "")?.adminToken || null; }
  catch { return null; }
}

function daysLeft(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/* ================================================================== */
/*  Shared Sub-components                                               */
/* ================================================================== */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; dot: string }> = {
    ready:        { cls: "bg-emerald-100 text-emerald-700 border-emerald-200",   label: "Connected",    dot: "bg-emerald-500" },
    pending:      { cls: "bg-amber-100 text-amber-700 border-amber-200",         label: "Pending QR",   dot: "bg-amber-500" },
    disconnected: { cls: "bg-gray-100 text-gray-500 border-gray-200",            label: "Offline",      dot: "bg-gray-400" },
    error:        { cls: "bg-red-100 text-red-600 border-red-200",               label: "Error",        dot: "bg-red-500" },
  };
  const c = map[status] || map.disconnected;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'ready' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

function PlanBadge({ instance }: { instance: Instance }) {
  const days = instance.plan === "active"
    ? daysLeft(instance.plan_expires_at)
    : daysLeft(instance.trial_ends_at);

  if (instance.plan === "active") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold"><CreditCard className="w-3 h-3" /> Active — {days}d left</span>;
  }
  if (days !== null && days > 0) {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-semibold"><Clock className="w-3 h-3" /> Trial — {days}d left</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-semibold"><Lock className="w-3 h-3" /> Expired</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button onClick={copy} title="Copy" className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
      {ok ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Toast({ ok, msg, onClose }: { ok: boolean; msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-xs
      ${ok ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
      {msg}
      <button onClick={onClose} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

function Alert({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <div className={`text-sm px-3 py-2.5 rounded-lg border ${ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {msg}
    </div>
  );
}

function Spinner({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-8 w-8 border-4" : "h-4 w-4 border-2";
  return <span className={`inline-block ${cls} border-current border-t-transparent rounded-full animate-spin`} />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-1.5">{children}</label>;
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400 ${props.className || ""}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none disabled:bg-gray-50 disabled:text-gray-400 ${props.className || ""}`}
    />
  );
}

function PrimaryBtn({ loading, children, ...props }: { loading?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition text-sm ${props.className || ""}`}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
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
      await sendMessage(getAdminToken()!, instanceName, phone.trim(), msg.trim());
      setResult({ ok: true, msg: "Message sent successfully!" });
      setMsg("");
    } catch (err: unknown) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed to send" });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {!isReady && (
        <div className="flex items-start gap-2.5 text-sm p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Connect this instance first to send messages.</span>
        </div>
      )}
      <div>
        <FieldLabel>Phone Number</FieldLabel>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="919876543210 (with country code)" disabled={!isReady} />
      </div>
      <div>
        <FieldLabel>Message</FieldLabel>
        <Textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Type your message..." disabled={!isReady} />
      </div>
      {result && <Alert ok={result.ok} msg={result.msg} />}
      <PrimaryBtn type="submit" loading={loading} disabled={!phone.trim() || !msg.trim() || !isReady}>
        <Send className="w-4 h-4" /> Send Message
      </PrimaryBtn>
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
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      await sendMedia(getAdminToken()!, instanceName, phone.trim(), base64, file.type, file.name, caption);
      setResult({ ok: true, msg: "Media sent!" });
      setFile(null); setCaption("");
    } catch (err: unknown) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {!isReady && (
        <div className="flex items-start gap-2.5 text-sm p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Instance must be connected.</span>
        </div>
      )}
      <div>
        <FieldLabel>Phone Number</FieldLabel>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="919876543210" disabled={!isReady} />
      </div>
      <div>
        <FieldLabel>File</FieldLabel>
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition
            ${file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-green-50/30"}
            ${!isReady ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          {file ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
              <p className="text-sm text-gray-400">Click to select image, video or document</p>
            </>
          )}
          <input id="file-input" type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} disabled={!isReady} />
        </div>
      </div>
      <div>
        <FieldLabel>Caption <span className="text-gray-400 font-normal">(optional)</span></FieldLabel>
        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." disabled={!isReady} />
      </div>
      {result && <Alert ok={result.ok} msg={result.msg} />}
      <PrimaryBtn type="submit" loading={loading} disabled={!phone.trim() || !file || !isReady}>
        <ImageIcon className="w-4 h-4" /> Send Media
      </PrimaryBtn>
    </form>
  );
}

/* ================================================================== */
/*  Tab: Chats                                                          */
/* ================================================================== */
function ChatsTab({ instanceName, isReady }: { instanceName: string; isReady: boolean }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const r = await getChats(getAdminToken()!, instanceName);
      setChats(r.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const loadMessages = async (chat: Chat) => {
    setSelected(chat); setMessages([]);
    try {
      setMsgLoading(true);
      const r = await getChatMessages(getAdminToken()!, instanceName, chat.id);
      setMessages(r.data || []);
    } catch { /* ignore */ } finally { setMsgLoading(false); }
  };

  if (!isReady) return (
    <div className="flex items-start gap-2.5 text-sm p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>Instance must be connected to view chats.</span>
    </div>
  );

  return (
    <div className="space-y-3">
      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl transition">
        {loading ? <Spinner /> : <RefreshCw className="w-3.5 h-3.5" />} Load Chats
      </button>

      {selected && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5 border-b">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${selected.isGroup ? "bg-blue-500" : "bg-green-500"}`}>
                {selected.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-semibold text-sm text-gray-800">{selected.name}</span>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition">Close</button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
            {msgLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">No messages</p>
            ) : messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${m.fromMe ? "bg-green-500 text-white ml-auto rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"}`}>
                {m.body || <span className="italic opacity-60">[{m.type}]</span>}
                <div className={`text-xs mt-0.5 ${m.fromMe ? "text-green-100" : "text-gray-400"}`}>{new Date(m.timestamp * 1000).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {chats.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 py-6">Click &quot;Load Chats&quot; to see your conversations</p>
        )}
        {chats.map(c => (
          <button key={c.id} onClick={() => loadMessages(c)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${c.isGroup ? "bg-blue-500" : "bg-green-500"}`}>
              {c.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkNum, setCheckNum] = useState("");
  const [checkResult, setCheckResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const load = async () => {
    try { setLoading(true); const r = await getContacts(getAdminToken()!, instanceName); setContacts(r.data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  const doCheck = async () => {
    if (!checkNum.trim()) return;
    try {
      setChecking(true); setCheckResult(null);
      const r = await checkNumber(getAdminToken()!, instanceName, checkNum.trim());
      setCheckResult({ ok: r.isRegistered, msg: r.isRegistered ? `${checkNum} is on WhatsApp` : `${checkNum} is NOT on WhatsApp` });
    } catch (err: unknown) {
      setCheckResult({ ok: false, msg: err instanceof Error ? err.message : "Check failed" });
    } finally { setChecking(false); }
  };

  if (!isReady) return (
    <div className="flex items-start gap-2.5 text-sm p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>Instance must be connected.</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Check WhatsApp Number</p>
        <div className="flex gap-2">
          <Input value={checkNum} onChange={e => setCheckNum(e.target.value)} placeholder="919876543210" className="flex-1" />
          <button onClick={doCheck} disabled={!checkNum.trim() || checking} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition flex items-center gap-1.5 flex-shrink-0">
            {checking ? <Spinner /> : <Phone className="w-3.5 h-3.5" />} Check
          </button>
        </div>
        {checkResult && <Alert ok={checkResult.ok} msg={checkResult.msg} />}
      </div>

      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl transition">
        {loading ? <Spinner /> : <Users className="w-3.5 h-3.5" />} Load Contacts
      </button>

      <div className="space-y-1 max-h-72 overflow-y-auto">
        {contacts.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 py-6">Click &quot;Load Contacts&quot; to see your contacts</p>
        )}
        {contacts.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-bold flex-shrink-0">
              {c.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParticipants, setNewParticipants] = useState("");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = async () => {
    try { setLoading(true); const r = await getGroups(getAdminToken()!, instanceName); setGroups(r.data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
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

  if (!isReady) return (
    <div className="flex items-start gap-2.5 text-sm p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>Instance must be connected.</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <form onSubmit={doCreate} className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">Create New Group</p>
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name" />
        <Input value={newParticipants} onChange={e => setNewParticipants(e.target.value)} placeholder="Numbers comma-separated: 9198..., 9187..." />
        {result && <Alert ok={result.ok} msg={result.msg} />}
        <button type="submit" disabled={creating || !newName.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition">
          {creating ? <Spinner /> : <Users className="w-3.5 h-3.5" />} Create Group
        </button>
      </form>

      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition">
        {loading ? <Spinner /> : <RefreshCw className="w-3.5 h-3.5" />} Load Groups
      </button>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {groups.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 py-6">Click &quot;Load Groups&quot; to see your groups</p>
        )}
        {groups.map(g => (
          <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">G</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{g.name}</p>
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
function WebhookTab({ instanceName }: { instanceName: string }) {
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
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Incoming Message Forwarding</p>
          <p className="text-blue-600">When a message arrives, we POST the payload to your webhook URL in real-time.</p>
        </div>
      </div>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <FieldLabel>Webhook URL</FieldLabel>
          <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-server.com/webhook" />
        </div>
        {result && <Alert ok={result.ok} msg={result.msg} />}
        <button type="submit" disabled={loading || !url.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">
          {loading ? <Spinner /> : <Globe className="w-4 h-4" />} Save Webhook
        </button>
      </form>
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Payload Example</p>
        <pre className="text-xs text-gray-300 font-mono overflow-x-auto leading-relaxed">{`{
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
/*  Tab: Auto Reply                                                     */
/* ================================================================== */
type AutoReplyScope = "private" | "groups" | "all";

function AutoReplyTab({ instanceName }: { instanceName: string }) {
  const [enabled, setEnabled] = useState(false);
  const [scope, setScope]     = useState<AutoReplyScope>("private");
  const [prompt, setPrompt]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  // Load current settings
  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    getAutoReplySettings(token, instanceName)
      .then(data => {
        setEnabled(!!data.enabled);
        setScope(data.scope || "private");
        setPrompt(data.prompt || "");
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [instanceName]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true); setResult(null);
      await updateAutoReplySettings(getAdminToken()!, instanceName, enabled, scope, prompt.trim());
      setResult({ ok: true, msg: "Auto-reply settings saved!" });
    } catch (err: unknown) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed to save" });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-12"><Spinner size="md" /></div>
  );

  const scopeOptions: { value: AutoReplyScope; label: string; desc: string }[] = [
    { value: "private", label: "Private chats only",  desc: "Reply to 1-on-1 messages, skip group chats" },
    { value: "groups",  label: "Group chats only",    desc: "Reply to group messages only" },
    { value: "all",     label: "All messages",         desc: "Reply to every incoming message" },
  ];

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Enable toggle */}
      <div className={`rounded-2xl border p-4 transition-colors ${enabled ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? "bg-green-100" : "bg-gray-100"}`}>
              <Bot className={`w-5 h-5 ${enabled ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Automated Reply</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled ? "Active — AI will reply to incoming messages" : "Inactive — messages won't be auto-replied"}
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${enabled ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Reply scope */}
      <div className={`space-y-3 transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          <FieldLabel>Reply Scope</FieldLabel>
        </div>
        <div className="space-y-2">
          {scopeOptions.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors
                ${scope === opt.value
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                className="mt-0.5 w-4 h-4 accent-green-600 flex-shrink-0"
              />
              <div>
                <span className={`text-sm font-semibold ${scope === opt.value ? "text-green-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className={`space-y-2 transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-400" />
          <FieldLabel>AI System Prompt</FieldLabel>
        </div>
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={5}
          placeholder={`Example:\nYou are a friendly customer service agent for Acme Corp. Answer questions about our products concisely and professionally. If you don't know something, say so politely.`}
          disabled={!enabled}
        />
        <p className="text-xs text-gray-400">
          This prompt is sent to Gemini AI as the system instruction when generating replies.
          Leave blank to use the default helpful-assistant prompt.
        </p>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Powered by Gemini 2.0 Flash</p>
          <p className="text-blue-600 text-xs">Responses are generated in real-time using Google&apos;s Gemini AI. Make sure <code className="font-mono bg-blue-100 px-1 rounded">GEMINI_API_KEY</code> is set in your backend <code className="font-mono bg-blue-100 px-1 rounded">.env</code>.</p>
        </div>
      </div>

      {result && <Alert ok={result.ok} msg={result.msg} />}

      <PrimaryBtn type="submit" loading={saving}>
        <Bot className="w-4 h-4" /> Save Auto-Reply Settings
      </PrimaryBtn>
    </form>
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
    if (!confirm(`Permanently delete "${instanceName}"? This cannot be undone.`)) return;
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

      {/* Disconnect */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-800">Disconnect WhatsApp</h3>
          <p className="text-sm text-gray-500 mt-0.5">Logs out of WhatsApp. Saved session is removed — you&apos;ll need to scan QR again to reconnect.</p>
        </div>
        <button
          onClick={doLogout}
          disabled={loading || instance.status !== "ready"}
          className="flex items-center gap-2 px-4 py-2 border border-amber-400 text-amber-700 hover:bg-amber-50 disabled:opacity-40 rounded-xl text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4" /> Disconnect
        </button>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-red-700">Delete Instance</h3>
          <p className="text-sm text-red-500 mt-0.5">Permanently removes this instance and all its data. Cannot be undone.</p>
        </div>
        <button
          onClick={doDelete}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition"
        >
          <Trash2 className="w-4 h-4" /> Delete Instance
        </button>
      </div>

      {/* API Reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick API Reference</p>
        <div className="space-y-1.5">
          {[
            ["POST", `instance/send/${instanceName}`,         "Send text message"],
            ["POST", `instance/send-media/${instanceName}`,   "Send image/file"],
            ["POST", `instance/chats/${instanceName}`,        "Get all chats"],
            ["POST", `instance/contacts/${instanceName}`,     "Get contacts"],
            ["POST", `instance/groups/${instanceName}`,       "Get groups"],
            ["POST", `instance/check-number/${instanceName}`, "Check number"],
            ["POST", `instance/webhook/${instanceName}`,      "Set webhook"],
            ["POST", `instance/auto-reply/${instanceName}`,   "Get auto-reply settings"],
            ["PUT",  `instance/auto-reply/${instanceName}`,   "Update auto-reply settings"],
          ].map(([m, p, d]) => (
            <div key={p} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
              <span className={`px-1.5 py-0.5 font-bold rounded font-mono text-xs flex-shrink-0 ${m === "PUT" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{m}</span>
              <code className="text-gray-500 flex-1 truncate font-mono">/{p}</code>
              <span className="text-gray-400 hidden sm:block flex-shrink-0">{d}</span>
            </div>
          ))}
        </div>
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
  const [toast, setToast]         = useState<{ ok: boolean; msg: string } | null>(null);

  const loadInstance = useCallback(async () => {
    try {
      setLoading(true);
      const t = getAdminToken();
      if (!t) { router.push("/auth/login"); return; }
      const r = await getAllInstances(t);
      const found = (r.data || []).find((i: Instance) => i.name === instanceName);
      if (!found) { setNotFound(true); return; }
      try {
        const statusData = await getInstanceStatus(t, instanceName);
        found.status = statusData.status;
      } catch { /* use DB status */ }
      setInstance(found);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [instanceName, router]);

  useEffect(() => { loadInstance(); }, [loadInstance]);

  const isExpired = () => {
    if (!instance) return false;
    if (instance.plan === "active" && instance.plan_expires_at && new Date(instance.plan_expires_at) > new Date()) return false;
    if (instance.trial_ends_at && new Date(instance.trial_ends_at) > new Date()) return false;
    return true;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading instance...</p>
      </div>
    </div>
  );

  if (notFound || !instance) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-1">Instance not found</h2>
      <p className="text-sm text-gray-400 mb-5">The instance &quot;{instanceName}&quot; doesn&apos;t exist or was deleted.</p>
      <button onClick={() => router.push("/instances")} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">
        Back to Instances
      </button>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "send",      label: "Send",      icon: <Send className="w-3.5 h-3.5" /> },
    { id: "media",     label: "Media",     icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: "chats",     label: "Chats",     icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "contacts",  label: "Contacts",  icon: <Phone className="w-3.5 h-3.5" /> },
    { id: "groups",    label: "Groups",    icon: <Users className="w-3.5 h-3.5" /> },
    { id: "webhook",   label: "Webhook",   icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "autoreply", label: "Auto Reply",icon: <Bot className="w-3.5 h-3.5" /> },
    { id: "settings",  label: "Settings",  icon: <Settings2 className="w-3.5 h-3.5" /> },
  ];

  const isReady = instance.status === "ready";

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-4">

        {/* Back button */}
        <button
          onClick={() => router.push("/instances")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Instances
        </button>

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Green header */}
          <div className="bg-gradient-to-br from-green-600 to-green-500 px-5 py-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {instance.name.charAt(0).toUpperCase()}
                  </div>
                  <h1 className="text-xl font-bold truncate">{instance.name}</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={instance.status} />
                  <PlanBadge instance={instance} />
                </div>
              </div>
              <button
                onClick={loadInstance}
                title="Refresh status"
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Token row */}
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Instance Token</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <code className="text-xs text-gray-600 font-mono flex-1 truncate">{instance.token}</code>
              <CopyBtn text={instance.token} />
            </div>
          </div>

          {/* Not connected banner */}
          {!isReady && (
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-800">Not Connected</p>
                <p className="text-xs text-amber-600">Scan the QR code to activate this instance.</p>
              </div>
              <button
                onClick={() => router.push(`/instances/${instance.name}/activate`)}
                className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition"
              >
                Connect
              </button>
            </div>
          )}

          {/* Expired banner */}
          {isExpired() && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5"><Lock className="w-4 h-4" /> Trial Expired</p>
                <p className="text-xs text-red-500">Subscribe to continue using this instance.</p>
              </div>
              <button
                onClick={() => router.push("/billing_subscription")}
                className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>

        {/* ── Tab panel ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab bar — scrollable on mobile */}
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition flex-shrink-0
                  ${activeTab === tab.id
                    ? "text-green-600 border-green-500 bg-green-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {tab.icon}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === "send"      && <SendTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "media"     && <MediaTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "chats"     && <ChatsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "contacts"  && <ContactsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "groups"    && <GroupsTab instanceName={instance.name} isReady={isReady} />}
            {activeTab === "webhook"   && <WebhookTab instanceName={instance.name} />}
            {activeTab === "autoreply" && <AutoReplyTab instanceName={instance.name} />}
            {activeTab === "settings"  && <SettingsTab instance={instance} instanceName={instance.name} />}
          </div>
        </div>

      </div>
    </div>
  );
}
