"use client";

import { useState } from "react";
import { createInstance } from "@/app/allapis";
import Image from "next/image";

function generateinstance_name() {
  const prefixes = ["Alpha", "Beta", "Gamma", "Delta", "Omega"];
  const suffix = Math.floor(Math.random() * 10000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffix}`;
}

export default function CreateInstance() {
  const [useCustomName, setUseCustomName] = useState(false);
  const [instance_name, setinstance_name] = useState(generateinstance_name());
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleModeChange = (isCustom: boolean) => {
    setUseCustomName(isCustom);
    if (!isCustom) {
      setinstance_name(generateinstance_name());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setinstance_name(e.target.value);
  };

  const validate = () => {
    if (useCustomName && instance_name.trim() === "") {
      setError("Instance name cannot be empty.");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    setQrCodeUrl(null);
    try {
      const token = localStorage.getItem("token") || "";
      const result = await createInstance(token, instance_name) as { qrCode?: string } | void;
      alert("Instance created successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

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
            value={instance_name}
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
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={160}
            height={160}
            className="border rounded-md"
            unoptimized // use this if qrCodeUrl is base64 or remote domain not yet configured in next.config.js
          />
        </div>
      )}
    </div>
  );
}
