"use client";

import { useState } from "react";
import { API_BASE_URL } from "../allapis";
import {
  ChevronDown, ChevronRight, Copy, CheckCheck, Terminal,
  MessageSquare, Image, MapPin, Users, Phone, Settings,
  CreditCard, ShieldCheck, Zap, Key
} from "lucide-react";

interface Endpoint {
  method: "POST" | "GET" | "DELETE" | "PUT";
  path: string;
  desc: string;
  auth: "token" | "jwt" | "none";
  body?: Record<string, string>;
  response?: Record<string, unknown>;
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  endpoints: Endpoint[];
}

const BASE = API_BASE_URL.replace(/\/$/, "");

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700",
  POST:   "bg-green-100 text-green-700",
  DELETE: "bg-red-100 text-red-600",
  PUT:    "bg-yellow-100 text-yellow-700",
};

const AUTH_BADGE: Record<string, { label: string; cls: string }> = {
  token: { label: "Admin Token", cls: "bg-indigo-100 text-indigo-700" },
  jwt:   { label: "JWT Bearer",  cls: "bg-purple-100 text-purple-700" },
  none:  { label: "Public",      cls: "bg-gray-100 text-gray-500" },
};

const sections: Section[] = [
  {
    id: "auth", label: "Authentication", icon: <Key className="w-4 h-4" />, color: "text-gray-700",
    endpoints: [
      {
        method: "POST", path: "/admins/login", desc: "Login and receive a JWT token.", auth: "none",
        body: { username: "string", password: "string" },
        response: { token: "eyJhbGc...", admin: { id: 1, username: "admin", name: "Admin Name", role: "admin", token: "hex-api-token" } },
      },
      {
        method: "POST", path: "/admins/create", desc: "Register a new admin account.", auth: "none",
        body: { username: "string", name: "string", email: "string", phone: "string", password: "string", address: "string" },
        response: { message: "Admin created successfully" },
      },
    ],
  },
  {
    id: "instance", label: "Instance Management", icon: <Settings className="w-4 h-4" />, color: "text-green-700",
    endpoints: [
      {
        method: "POST", path: "/instance/create", desc: "Create a new WhatsApp instance (6-day free trial included).", auth: "token",
        body: { token: "your-admin-api-token", instance_name: "my-instance" },
        response: { message: "Instance created", instance: { id: 1, name: "my-instance", trial_ends_at: "2026-03-11T..." } },
      },
      {
        method: "POST", path: "/instance/list", desc: "List all instances for the authenticated admin.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { data: [{ id: 1, name: "my-instance", status: "ready", plan: "trial", trial_ends_at: "..." }] },
      },
      {
        method: "POST", path: "/instance/status/:id", desc: "Get current connection status of an instance.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { status: "ready", qr: null },
      },
      {
        method: "POST", path: "/instance/start", desc: "Start / connect an instance and get QR code if needed.", auth: "token",
        body: { token: "your-admin-api-token", instance_name: "my-instance" },
        response: { status: "qr", qr: "data:image/png;base64,..." },
      },
      {
        method: "GET", path: "/instance/qrpng/:id?token=TOKEN", desc: "Get QR code as a PNG image (use in <img> tag).", auth: "token",
        response: { _note: "Returns PNG binary. Use in <img src=...>" },
      },
      {
        method: "POST", path: "/instance/webhook/:id", desc: "Set a webhook URL to receive incoming message events.", auth: "token",
        body: { token: "your-admin-api-token", webhookUrl: "https://your-server.com/webhook" },
        response: { message: "Webhook updated" },
      },
      {
        method: "DELETE", path: "/instance/logout/:id", desc: "Disconnect WhatsApp session (keeps instance, clears session).", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { message: "Instance logged out" },
      },
      {
        method: "DELETE", path: "/instance/:id", desc: "Permanently delete an instance and all its data.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { message: "Instance deleted" },
      },
    ],
  },
  {
    id: "messaging", label: "Messaging", icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-700",
    endpoints: [
      {
        method: "POST", path: "/instance/send/:id", desc: "Send a text message to a WhatsApp number.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210", message: "Hello!" },
        response: { success: true, messageId: "true_9198..._ABCD" },
      },
      {
        method: "POST", path: "/instance/send-media/:id", desc: "Send media (image/video/audio/doc) from base64.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210", base64: "data:image/png;base64,...", mimetype: "image/png", filename: "photo.png", caption: "optional caption" },
        response: { success: true, messageId: "..." },
      },
      {
        method: "POST", path: "/instance/send-media-url/:id", desc: "Send media directly from a URL.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210", url: "https://example.com/image.jpg", caption: "optional" },
        response: { success: true, messageId: "..." },
      },
      {
        method: "POST", path: "/instance/send-location/:id", desc: "Send a location pin.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210", latitude: 28.6139, longitude: 77.2090, description: "New Delhi" },
        response: { success: true, messageId: "..." },
      },
    ],
  },
  {
    id: "chats", label: "Chats & Messages", icon: <Zap className="w-4 h-4" />, color: "text-orange-700",
    endpoints: [
      {
        method: "POST", path: "/instance/chats/:id", desc: "Get list of all chats.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { chats: [{ id: "919876543210@c.us", name: "John", unreadCount: 2, lastMessage: { body: "Hi", timestamp: 1700000 } }] },
      },
      {
        method: "POST", path: "/instance/messages/:id/:chatId", desc: "Get message history for a chat.", auth: "token",
        body: { token: "your-admin-api-token", limit: 50 },
        response: { messages: [{ id: { id: "ABCD" }, body: "Hello", from: "919...", timestamp: 1700000, fromMe: false }] },
      },
      {
        method: "POST", path: "/instance/mark-read/:id", desc: "Mark a chat as read.", auth: "token",
        body: { token: "your-admin-api-token", chatId: "919876543210@c.us" },
        response: { success: true },
      },
      {
        method: "POST", path: "/instance/react/:id", desc: "React to a message with an emoji.", auth: "token",
        body: { token: "your-admin-api-token", chatId: "919876543210@c.us", messageId: "ABCD1234", emoji: "👍" },
        response: { success: true },
      },
      {
        method: "POST", path: "/instance/delete-message/:id", desc: "Delete a message (for me or everyone).", auth: "token",
        body: { token: "your-admin-api-token", chatId: "919876543210@c.us", messageId: "ABCD1234", forEveryone: true },
        response: { success: true },
      },
    ],
  },
  {
    id: "contacts", label: "Contacts", icon: <Phone className="w-4 h-4" />, color: "text-teal-700",
    endpoints: [
      {
        method: "POST", path: "/instance/contacts/:id", desc: "Get all contacts saved on the WhatsApp account.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { contacts: [{ id: "919...", name: "John", number: "919..." }] },
      },
      {
        method: "POST", path: "/instance/check-number/:id", desc: "Check if a phone number is registered on WhatsApp.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210" },
        response: { exists: true, id: "919876543210@c.us" },
      },
      {
        method: "POST", path: "/instance/profile-pic/:id", desc: "Get profile picture URL of a contact.", auth: "token",
        body: { token: "your-admin-api-token", number: "919876543210" },
        response: { url: "https://pps.whatsapp.net/..." },
      },
      {
        method: "POST", path: "/instance/account-info/:id", desc: "Get info about the connected WhatsApp account.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { id: "919876543210@c.us", name: "My Business", pushname: "My Business", platform: "android" },
      },
    ],
  },
  {
    id: "groups", label: "Groups", icon: <Users className="w-4 h-4" />, color: "text-indigo-700",
    endpoints: [
      {
        method: "POST", path: "/instance/groups/:id", desc: "List all WhatsApp groups.", auth: "token",
        body: { token: "your-admin-api-token" },
        response: { groups: [{ id: "120363...", name: "My Group", participantCount: 5 }] },
      },
      {
        method: "POST", path: "/instance/create-group/:id", desc: "Create a new WhatsApp group.", auth: "token",
        body: { token: "your-admin-api-token", name: "My New Group", participants: ["919876543210", "919876543211"] },
        response: { success: true, groupId: "120363...@g.us" },
      },
      {
        method: "POST", path: "/instance/group-add/:id", desc: "Add participants to a group.", auth: "token",
        body: { token: "your-admin-api-token", groupId: "120363...@g.us", participants: ["919876543212"] },
        response: { success: true },
      },
      {
        method: "POST", path: "/instance/group-remove/:id", desc: "Remove participants from a group.", auth: "token",
        body: { token: "your-admin-api-token", groupId: "120363...@g.us", participants: ["919876543212"] },
        response: { success: true },
      },
    ],
  },
  {
    id: "webhook", label: "Webhook Events", icon: <Zap className="w-4 h-4" />, color: "text-yellow-700",
    endpoints: [
      {
        method: "POST", path: "(your webhook URL)", desc: "Events sent to your webhook URL when messages arrive.", auth: "none",
        body: { event: "message", instanceId: "my-instance", data: { from: "919...", body: "Hello", timestamp: 1700000, type: "chat", fromMe: false } as unknown as string },
        response: { _note: "Your server must return HTTP 200. Retries: none." },
      },
    ],
  },
  {
    id: "payments", label: "Billing & Payments", icon: <CreditCard className="w-4 h-4" />, color: "text-emerald-700",
    endpoints: [
      {
        method: "POST", path: "/payments/request", desc: "Submit a payment request for an instance subscription.", auth: "jwt",
        body: { instanceId: 1, amount: 9.99, currency: "USD", durationDays: 30, paymentMethod: "bank_transfer", transactionId: "TXN123", notes: "optional" },
        response: { message: "Payment request submitted", paymentId: 5 },
      },
      {
        method: "GET", path: "/payments/my", desc: "Get all payment requests submitted by the current admin.", auth: "jwt",
        response: { data: [{ id: 1, instance_name: "my-instance", amount: 9.99, status: "approved", duration_days: 30 }] },
      },
      {
        method: "GET", path: "/payments/instance/:instanceId", desc: "Get payment history for a specific instance.", auth: "jwt",
        response: { data: [{ id: 1, status: "pending", amount: 9.99 }] },
      },
    ],
  },
  {
    id: "superadmin", label: "Super Admin", icon: <ShieldCheck className="w-4 h-4" />, color: "text-purple-700",
    endpoints: [
      {
        method: "GET", path: "/superadmin/stats", desc: "Get platform-wide statistics.", auth: "jwt",
        response: { data: { totalAdmins: 12, totalInstances: 45, activeInstances: 30, pendingPayments: 3, totalRevenue: "450.00" } },
      },
      {
        method: "GET", path: "/superadmin/admins", desc: "List all admin accounts with instance counts.", auth: "jwt",
        response: { data: [{ id: 1, username: "admin1", name: "Admin One", instance_count: 3, role: "admin" }] },
      },
      {
        method: "DELETE", path: "/superadmin/admins/:id", desc: "Delete an admin account (and all their instances).", auth: "jwt",
        response: { message: "Admin deleted" },
      },
      {
        method: "GET", path: "/superadmin/instances", desc: "List all instances across all admins.", auth: "jwt",
        response: { data: [{ id: 1, name: "inst1", status: "ready", plan: "active", admin_username: "admin1" }] },
      },
      {
        method: "POST", path: "/superadmin/instances/:id/lock", desc: "Lock an instance (expire subscription).", auth: "jwt",
        response: { message: "Instance locked" },
      },
      {
        method: "POST", path: "/superadmin/instances/:id/unlock", desc: "Unlock an instance for a given number of days.", auth: "jwt",
        body: { days: 30 },
        response: { message: "Instance unlocked for 30 days" },
      },
      {
        method: "GET", path: "/superadmin/payments", desc: "List all payment requests. Filter: ?status=pending", auth: "jwt",
        response: { data: [{ id: 1, instance_name: "inst1", amount: 9.99, status: "pending" }] },
      },
      {
        method: "POST", path: "/superadmin/payments/:id/approve", desc: "Approve a payment and activate instance plan.", auth: "jwt",
        response: { message: "Payment approved" },
      },
      {
        method: "POST", path: "/superadmin/payments/:id/reject", desc: "Reject a payment request with a reason.", auth: "jwt",
        body: { reason: "Invalid transaction ID" },
        response: { message: "Payment rejected" },
      },
      {
        method: "POST", path: "/superadmin/seed", desc: "Create first super admin account (public, one-time use).", auth: "none",
        body: { username: "superadmin", name: "Super Admin", password: "secure_password" },
        response: { message: "Super admin created", token: "eyJhbGc..." },
      },
    ],
  },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="p-1 rounded hover:bg-white/20 transition"
      title="Copy"
    >
      {ok ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const fullPath = `${BASE}${ep.path}`;
  const authInfo = AUTH_BADGE[ep.auth];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition text-left"
      >
        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono flex-shrink-0 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
        <code className="text-sm text-gray-800 font-mono flex-1 truncate">{ep.path}</code>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline flex-shrink-0 ${authInfo.cls}`}>{authInfo.label}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          <p className="text-sm text-gray-600">{ep.desc}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${authInfo.cls}`}>Auth: {authInfo.label}</span>
            {ep.auth === "token" && (
              <span className="text-xs text-gray-500">Pass <code className="bg-gray-200 px-1 rounded">token</code> in request body</span>
            )}
            {ep.auth === "jwt" && (
              <span className="text-xs text-gray-500">Pass <code className="bg-gray-200 px-1 rounded">Authorization: Bearer &lt;jwt&gt;</code> header</span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ep.body && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Request Body</p>
                  <CopyBtn text={JSON.stringify(ep.body, null, 2)} />
                </div>
                <pre className="bg-gray-900 text-green-300 text-xs rounded-lg p-3 overflow-x-auto leading-relaxed">
                  {JSON.stringify(ep.body, null, 2)}
                </pre>
              </div>
            )}
            {ep.response && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response</p>
                  <CopyBtn text={JSON.stringify(ep.response, null, 2)} />
                </div>
                <pre className="bg-gray-900 text-blue-300 text-xs rounded-lg p-3 overflow-x-auto leading-relaxed">
                  {JSON.stringify(ep.response, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Terminal className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <code className="text-xs text-gray-600 font-mono flex-1 truncate">{fullPath}</code>
            <CopyBtn text={fullPath} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("auth");

  const current = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Sections</p>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                  activeSection === s.id
                    ? "bg-white border border-gray-200 shadow-sm text-gray-900"
                    : "text-gray-500 hover:bg-white hover:text-gray-900"
                }`}
              >
                <span className={activeSection === s.id ? s.color : "text-gray-400"}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile section tabs */}
        <div className="lg:hidden w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeSection === s.id ? "bg-white border border-gray-200 shadow-sm text-gray-900" : "text-gray-500 hover:bg-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <h1 className="text-2xl font-bold">API Documentation</h1>
            <p className="text-green-100 text-sm mt-1">WhatsApp API for building messaging automation and integrations.</p>
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Terminal className="w-4 h-4 text-green-200" />
              <code className="text-sm text-white font-mono">{BASE}</code>
              <CopyBtn text={BASE} />
            </div>
          </div>

          {/* Auth notes */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${AUTH_BADGE.token.cls}`}>Admin Token</span>
              </div>
              <p className="text-xs text-gray-600">Your Admin API token (hex string). Found in your profile. Pass as <code className="bg-gray-100 px-1 rounded">token</code> field in request body.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${AUTH_BADGE.jwt.cls}`}>JWT Bearer</span>
              </div>
              <p className="text-xs text-gray-600">JWT returned on login. Pass as <code className="bg-gray-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code> HTTP header.</p>
            </div>
          </div>

          {/* Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={current.color}>{current.icon}</span>
              <h2 className="text-lg font-bold text-gray-900">{current.label}</h2>
              <span className="text-xs text-gray-400 ml-auto">{current.endpoints.length} endpoint{current.endpoints.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              {current.endpoints.map((ep, i) => (
                <EndpointCard key={i} ep={ep} />
              ))}
            </div>
          </div>

          {/* Trial & subscription note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Trial & Subscription</p>
            <p>Each instance includes a <strong>6-day free trial</strong>. After expiry, messaging APIs return <code className="bg-amber-100 px-1 rounded">HTTP 402 SUBSCRIPTION_REQUIRED</code>. Go to <strong>Billing</strong> to subscribe.</p>
          </div>

          {/* Webhook payload example */}
          {activeSection === "webhook" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Webhook Payload Example</h3>
              <pre className="bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
{`POST https://your-server.com/webhook
Content-Type: application/json

{
  "event": "message",
  "instanceId": "my-instance",
  "data": {
    "id": { "id": "ABCD1234EFGH5678" },
    "from": "919876543210@c.us",
    "to": "918888888888@c.us",
    "body": "Hello from WhatsApp!",
    "type": "chat",
    "timestamp": 1700000000,
    "fromMe": false,
    "hasMedia": false,
    "author": null
  }
}`}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
