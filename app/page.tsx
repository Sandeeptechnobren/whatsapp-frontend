"use client";

import { APP_NAME } from "./config";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 dark:from-gray-900 dark:to-black transition-colors duration-500 p-6">
      <div className="flex flex-col items-center space-y-6 text-center max-w-xl">
        {/* App Title */}
        <h1 className="text-5xl font-extrabold text-green-700 dark:text-green-400 drop-shadow-sm">
          Welcome to {APP_NAME}
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          Automate your WhatsApp conversations effortlessly. <br />
          Manage chats, customers, and devices all from one place — powered by AI.
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sign up to get started or login if you already have an account.
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-6">
        <button
          onClick={() => router.push("/auth/login")}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-2xl shadow-md hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/auth/register")}
          className="px-8 py-3 bg-white dark:bg-transparent border-2 border-green-600 text-green-600 dark:text-green-400 font-semibold rounded-2xl shadow-md hover:bg-green-50 dark:hover:bg-green-950/20 active:scale-95 transition-all duration-200"
        >
          Sign Up
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="mt-16 text-center text-gray-600 dark:text-gray-400 space-y-3">
        <p className="flex items-center justify-center gap-2">
          💡 <span>AI-powered automation that responds while you focus on business.</span>
        </p>
        <p className="flex items-center justify-center gap-2">
          🚀 <span>Quick setup, seamless integration, and insightful analytics.</span>
        </p>
        <p className="flex items-center justify-center gap-2">
          ⚙️ <span>Reliable, secure, and built for scalability.</span>
        </p>
      </div>
    </main>
  );
}
