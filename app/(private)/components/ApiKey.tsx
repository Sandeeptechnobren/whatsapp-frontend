"use client";

import { useState } from "react";
import { KeyRound, CopyCheck, Copy } from "lucide-react";

export default function ApiKey() {
  const [copied, setCopied] = useState(false);
  const apiKey = "sk_live_12345xyz67890";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-red-500" /> API Key
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        Use this key to connect your services:
      </p>
      <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm">
        {apiKey}
      </div>
      <button
        onClick={handleCopy}
        className="mt-3 px-3 py-1 text-sm bg-gray-800 text-white rounded-md flex items-center gap-2 hover:bg-gray-900 transition"
      >
        {copied ? (
          <>
            <CopyCheck className="w-4 h-4 text-green-400" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> Copy Key
          </>
        )}
      </button>
    </div>
  );
}
