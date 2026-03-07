"use client";

import { APP_NAME } from "./config";
import { useRouter } from "next/navigation";
import { MessageSquareMore, Zap, Shield, Globe, ChevronRight } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-5 h-5 text-green-600" />,
    title: "Multi-Instance",
    desc: "Connect multiple WhatsApp numbers and manage them from one dashboard.",
  },
  {
    icon: <Globe className="w-5 h-5 text-green-600" />,
    title: "Webhook Support",
    desc: "Receive incoming messages in real-time via configurable webhook URLs.",
  },
  {
    icon: <Shield className="w-5 h-5 text-green-600" />,
    title: "REST API",
    desc: "Simple token-based API to send messages and manage instances programmatically.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex flex-col">
      {/* Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
            <MessageSquareMore className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          WhatsApp API Platform
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-2xl">
          WhatsApp API,{" "}
          <span className="text-green-600">Made Simple.</span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-xl">
          Connect WhatsApp numbers, send messages, and receive webhooks — all through a clean REST API. No extra fees, your own server.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push("/auth/register")}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl shadow-md hover:bg-green-700 active:scale-95 transition-all"
          >
            Start for Free <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-3 border-2 border-green-600 text-green-700 font-semibold rounded-2xl hover:bg-green-50 active:scale-95 transition-all"
          >
            Login
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-20 grid sm:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-left">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-gray-400 pb-6">
        &copy; {new Date().getFullYear()} {APP_NAME}. Self-hosted WhatsApp API.
      </footer>
    </main>
  );
}
