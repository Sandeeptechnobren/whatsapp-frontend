"use client";

import { KeyRound } from "lucide-react";

export default function ApiKey() {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-red-500" /> API Key
      </h2>
      <p className="text-sm text-gray-600 mb-3">Use this key to connect your services:</p>
      <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm">
        sk_live_12345xyz67890
      </div>
      <button className="mt-3 px-3 py-1 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900">
        Copy Key
      </button>
    </div>
  );
}
