"use client";

import { useState } from "react";

function generateInstanceName() {
  const prefixes = ["Alpha", "Beta", "Gamma", "Delta", "Omega"];
  const suffix = Math.floor(Math.random() * 10000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffix}`;
}

export default function CreateInstance() {
  const [useCustomName, setUseCustomName] = useState(false);
  const [instanceName, setInstanceName] = useState(generateInstanceName());
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleModeChange = (isCustom: boolean) => {
    setUseCustomName(isCustom);
    if (!isCustom) {
      setInstanceName(generateInstanceName());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstanceName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQrCodeUrl(null);
    try {
      // Replace with your real endpoint
      const response = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: instanceName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create instance");
      }
      // Assume backend returns { qrCode: "https://..." } or { qrCode: "data:image/png;base64,..." }
      const data = await response.json();
      setQrCodeUrl(data.qrCode); // qrCode is URL or data base64 from backend
    } catch (err: unknown ) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Create Instance</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 text-emerald-600">
          <label className="block font-medium mb-1">Name type:</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="auto"
                checked={!useCustomName}
                onChange={() => handleModeChange(false)}
                className="mr-2"
                name="nameType"
              />
              Auto-generate Name
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={useCustomName}
                onChange={() => handleModeChange(true)}
                className="mr-2"
                name="nameType"
              />
              Enter Custom Name
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">
            {useCustomName ? "Your Preferred Name" : "Generated Name"}
          </label>
          <input
            type="text"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              useCustomName ? "" : "bg-gray-100 text-gray-500"
            }`}
            value={instanceName}
            onChange={handleInputChange}
            disabled={!useCustomName}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Instance"}
        </button>
        {error && (
          <div className="mt-4 text-red-600 text-center font-medium">{error}</div>
        )}
      </form>
      {/* QR Code Display */}
      {qrCodeUrl && (
        <div className="mt-6 flex flex-col items-center">
          <span className="font-bold mb-2">Instance QR Code:</span>
          <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 border rounded-md" />
        </div>
      )}
    </div>
  );
}
