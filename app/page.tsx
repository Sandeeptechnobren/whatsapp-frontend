"use client";

import { APP_NAME } from "./config";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-6">
      <div className="flex flex-col items-center space-y-6 text-center max-w-xl">
        <h1 className="text-5xl font-extrabold text-green-700">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-gray-600 text-lg">
          Automate your WhatsApp conversations effortlessly. <br />
          Manage chats, customers, and devices all from one place, powered by AI.
        </p>
        <p className="text-gray-500 text-sm">
          Sign up to get started or login if you already have an account.
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex gap-6">
        <button
          onClick={() => router.push("/auth/login")}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-green-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/auth/register")}
          className="px-8 py-3 bg-white border-2 border-green-600 text-green-600 font-semibold rounded-2xl shadow-lg hover:bg-green-50 transition"
        >
          Sign Up
        </button>
      </div>
      <div className="mt-16 text-center text-gray-500 space-y-2">
        <p>💡 AI-powered automation to handle messages while you focus on your business.</p>
        <p>🚀 Quick setup, seamless integration, and powerful analytics.</p>
      </div>
    </main>
  );
}
