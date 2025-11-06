"use client";

import { Database } from "lucide-react";

export default function ApiUsage() {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-indigo-500" /> API Usage
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        Your system is connected to <span className="font-semibold">WhatsApp API</span>.
        Below is your usage summary for today:
      </p>
      <ul className="text-sm text-gray-700 space-y-2">
        <li>✅ 560 messages sent</li>
        <li>📥 489 messages received</li>
        <li>⚠️ 3 errors logged</li>
      </ul>
    </div>
  );
}
