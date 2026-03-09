'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAISettings, updateAISettings, testAIConnection } from "../allapis";
import {
  Bot, Eye, EyeOff, CheckCircle, XCircle, Loader2,
  Zap, ChevronDown, Save, FlaskConical, ArrowLeft,
} from "lucide-react";

function getAdminToken() {
  try { return JSON.parse(localStorage.getItem("admin") || "")?.adminToken || null; }
  catch { return null; }
}

const GROQ_MODELS = [
  { value: "llama-3.3-70b-versatile",  label: "Llama 3.3 70B Versatile",  tag: "Recommended" },
  { value: "llama-3.1-8b-instant",     label: "Llama 3.1 8B Instant",      tag: "Fastest" },
  { value: "llama-3.1-70b-versatile",  label: "Llama 3.1 70B Versatile",   tag: "" },
  { value: "mixtral-8x7b-32768",       label: "Mixtral 8x7B 32K",          tag: "Long Context" },
  { value: "gemma2-9b-it",             label: "Gemma 2 9B",                 tag: "" },
  { value: "llama3-70b-8192",          label: "Llama 3 70B",                tag: "" },
  { value: "llama3-8b-8192",           label: "Llama 3 8B",                 tag: "" },
];

type TestState = "idle" | "loading" | "ok" | "fail";

export default function SettingsPage() {
  const router = useRouter();

  const [apiKey, setApiKey]     = useState("");
  const [model, setModel]       = useState("llama-3.3-70b-versatile");
  const [showKey, setShowKey]   = useState(false);
  const [keySet, setKeySet]     = useState(false);        // whether DB already has a key
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");
  const [testMsg, setTestMsg]   = useState("");
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [customModel, setCustomModel] = useState(false);

  // Load current settings
  useEffect(() => {
    const token = getAdminToken();
    if (!token) { router.push("/auth/login"); return; }
    getAISettings(token)
      .then(data => {
        if (data.groqApiKeySet) setKeySet(true);
        setApiKey(""); // never pre-fill the actual key for security
        setModel(data.groqModel || "llama-3.3-70b-versatile");
        // if saved model isn't in the preset list, switch to custom mode
        if (data.groqModel && !GROQ_MODELS.find(m => m.value === data.groqModel)) {
          setCustomModel(true);
        }
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return;
    try {
      setSaving(true); setError(""); setSaved(false);
      // Only send the key if the user typed something new
      await updateAISettings(token, apiKey.trim(), model.trim());
      setSaved(true);
      if (apiKey.trim()) setKeySet(true);
      setApiKey(""); // clear input after save
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  };

  const handleTest = async () => {
    const token = getAdminToken();
    if (!token) return;
    setTestState("loading"); setTestMsg("");
    try {
      const data = await testAIConnection(token, apiKey.trim(), model.trim());
      setTestState("ok");
      setTestMsg(`Connected! Model replied: "${data.reply}" (using ${data.model})`);
    } catch (err: unknown) {
      setTestState("fail");
      setTestMsg(err instanceof Error ? err.message : "Connection failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 space-y-5">

        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-violet-600 to-violet-500 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Settings</h1>
                <p className="text-violet-200 text-sm mt-0.5">Configure Groq AI for automated replies</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">

            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Groq API Key
                {keySet && (
                  <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Key saved ✓
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={keySet ? "Enter new key to replace the saved one" : "gsk_xxxxxxxxxxxxxxxxxxxx"}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Get your free API key at{" "}
                <span className="font-mono text-violet-600">console.groq.com</span>.
                The key is stored securely per-account and never exposed in the UI.
              </p>
            </div>

            {/* Model selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">Groq Model</label>
                <button
                  type="button"
                  onClick={() => setCustomModel(v => !v)}
                  className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                >
                  {customModel ? "← Pick from list" : "Enter custom model →"}
                </button>
              </div>

              {customModel ? (
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. llama-3.3-70b-versatile"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-mono"
                />
              ) : (
                <div className="relative">
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition cursor-pointer"
                  >
                    {GROQ_MODELS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}{m.tag ? ` — ${m.tag}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* Model cards */}
              {!customModel && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {GROQ_MODELS.filter(m => m.tag).map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setModel(m.value)}
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs transition
                        ${model === m.value
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className="font-semibold block">{m.label}</span>
                      <span className={`mt-0.5 inline-block px-1.5 py-0.5 rounded text-xs font-medium
                        ${m.tag === "Recommended" ? "bg-green-100 text-green-700" :
                          m.tag === "Fastest"      ? "bg-blue-100 text-blue-700" :
                                                     "bg-gray-100 text-gray-500"}`}
                      >
                        {m.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test connection result */}
            {testState !== "idle" && (
              <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm
                ${testState === "ok"      ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                  testState === "fail"    ? "bg-red-50 border-red-200 text-red-700" :
                                            "bg-gray-50 border-gray-200 text-gray-600"}`}>
                {testState === "loading" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />}
                {testState === "ok"      && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {testState === "fail"    && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{testState === "loading" ? "Testing connection..." : testMsg}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                <CheckCircle className="w-4 h-4" /> Settings saved! All running instances updated instantly.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleTest}
                disabled={testState === "loading" || saving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-violet-400 text-violet-700 hover:bg-violet-50 disabled:opacity-50 rounded-xl text-sm font-semibold transition"
              >
                {testState === "loading"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FlaskConical className="w-4 h-4" />}
                Test Connection
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* How it works card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            <p className="text-sm font-bold text-gray-700">How Auto-Reply Works</p>
          </div>
          <ol className="space-y-2 text-sm text-gray-600">
            {[
              "A message arrives on your WhatsApp instance.",
              "The system checks if Auto Reply is enabled for that instance.",
              "The scope filter determines whether to reply (private, groups, or all).",
              "Your instance's AI prompt is sent to Groq as the system instruction.",
              "Groq generates a reply using the model you configured here.",
              "The reply is sent back to the sender automatically.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <strong>Note:</strong> Settings saved here apply to all your instances. The AI prompt (system instruction) is configured per-instance in the <strong>Auto Reply</strong> tab of each instance.
          </div>
        </div>

      </div>
    </div>
  );
}
