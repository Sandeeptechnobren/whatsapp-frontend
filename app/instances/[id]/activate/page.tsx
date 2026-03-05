'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../allapis";
import { Smartphone, CheckCircle, RefreshCw, ArrowLeft, Wifi } from "lucide-react";

type Status = "idle" | "loading" | "pending" | "ready" | "error";

function getAdminToken(): string | null {
  try {
    const stored = localStorage.getItem("admin");
    if (!stored) return null;
    return JSON.parse(stored)?.adminToken || null;
  } catch {
    return null;
  }
}

export default function ActivateInstance() {
  const params = useParams();
  const router = useRouter();
  const instanceName = params.id as string;

  const [status, setStatus] = useState<Status>("idle");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qrObjectUrlRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const revokeQrUrl = () => {
    if (qrObjectUrlRef.current) {
      URL.revokeObjectURL(qrObjectUrlRef.current);
      qrObjectUrlRef.current = null;
    }
  };

  const connectInstance = async () => {
    try {
      setStatus("loading");
      setError(null);

      const token = getAdminToken();
      if (!token) throw new Error("Session expired. Please login again.");

      const res = await fetch(`${API_BASE_URL}instance/connect/${instanceName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Connection failed");
      }

      const blob = await res.blob();
      revokeQrUrl();

      const imageUrl = URL.createObjectURL(blob);
      qrObjectUrlRef.current = imageUrl;

      setQrUrl(imageUrl);
      setStatus("pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setStatus("error");
    }
  };

  const checkStatus = async () => {
    try {
      const token = getAdminToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}instance/status/${instanceName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.ready) {
        clearPolling();
        revokeQrUrl();
        setQrUrl(null);
        setStatus("ready");
        setTimeout(() => router.push(`/instances/${instanceName}`), 1500);
      }
    } catch {
      // silently ignore polling errors
    }
  };

  useEffect(() => {
    if (status === "pending" && qrUrl) {
      pollingRef.current = setInterval(checkStatus, 3000);
    }
    return clearPolling;
  }, [status, qrUrl]);

  useEffect(() => {
    return () => {
      clearPolling();
      revokeQrUrl();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push("/instances")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Instances
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-5 h-5" />
              <h1 className="text-lg font-bold">Connect WhatsApp</h1>
            </div>
            <p className="text-green-100 text-sm">
              Instance: <span className="font-semibold text-white">{instanceName}</span>
            </p>
          </div>

          <div className="p-6">
            {/* IDLE STATE */}
            {status === "idle" && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-gray-800 font-semibold mb-2">Ready to connect?</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Click the button below to generate a QR code, then scan it with WhatsApp on your phone.
                </p>
                <button
                  onClick={connectInstance}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
                >
                  Generate QR Code
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {status === "loading" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Initializing WhatsApp...</p>
                <p className="text-gray-400 text-sm mt-1">This may take up to 30 seconds</p>
              </div>
            )}

            {/* QR PENDING STATE */}
            {status === "pending" && qrUrl && (
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={qrUrl}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 rounded-xl border-4 border-green-100 shadow-sm mx-auto"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
                </div>

                <div className="mt-5 space-y-3">
                  <p className="font-semibold text-gray-800">Scan with WhatsApp</p>
                  <ol className="text-left text-sm text-gray-500 space-y-1.5 bg-gray-50 rounded-xl p-4">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">1.</span>
                      Open WhatsApp on your phone
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">2.</span>
                      Go to <span className="font-medium">Settings &rarr; Linked Devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">3.</span>
                      Tap <span className="font-medium">Link a Device</span> and scan this QR
                    </li>
                  </ol>
                </div>

                <button
                  onClick={connectInstance}
                  className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh QR
                </button>
              </div>
            )}

            {/* SUCCESS STATE */}
            {status === "ready" && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-green-700 font-bold text-lg mb-1">Connected!</h2>
                <p className="text-gray-500 text-sm">Redirecting to your instance dashboard...</p>
              </div>
            )}

            {/* ERROR STATE */}
            {status === "error" && (
              <div className="text-center">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={connectInstance}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
