'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../allapis";

export default function ActivateInstance() {
  const params = useParams();
  const router = useRouter();
  const instanceName = params.id as string;

  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);

  const qrObjectUrlRef = useRef<string | null>(null);
  const getAdminToken = () => {
    const stored = localStorage.getItem("admin");
    if (!stored) throw new Error("Unauthorized. Please login again.");

    const parsed = JSON.parse(stored);
    if (!parsed?.adminToken)
      throw new Error("Unauthorized. Please login again.");

    return parsed.adminToken;
  };
  const connectInstance = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAdminToken();

      const res = await fetch(
        `${API_BASE_URL}instance/connect/${instanceName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Connection failed");
      }
      const blob = await res.blob();
      if (qrObjectUrlRef.current) {
        URL.revokeObjectURL(qrObjectUrlRef.current);
      }

      const imageUrl = URL.createObjectURL(blob);
      qrObjectUrlRef.current = imageUrl;

      setQrUrl(imageUrl);
      setStatus("pending");
      setLoading(false);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setStatus("idle");
    }
  };
  const checkStatus = async () => {
    try {
      const token = getAdminToken();

      const res = await fetch(
        `${API_BASE_URL}instance/status/${instanceName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data.ready) {
        setStatus("ready");
        if (qrObjectUrlRef.current) {
          URL.revokeObjectURL(qrObjectUrlRef.current);
          qrObjectUrlRef.current = null;
        }

        setQrUrl(null);

        setTimeout(() => {
          router.push(`/instances/${instanceName}`);
        }, 1200);
      }
    } catch {
    }
  };
  useEffect(() => {
    if (status !== "pending" || !qrUrl) return;

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [status, qrUrl]); 
  useEffect(() => {
    return () => {
      if (qrObjectUrlRef.current) {
        URL.revokeObjectURL(qrObjectUrlRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Connect WhatsApp Instance</h1>
      <p><b>Instance:</b> {instanceName}</p>

      {status === "idle" && (
        <button
          onClick={connectInstance}
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginTop: 20
          }}
        >
          Connect WhatsApp
        </button>
      )}

      {loading && (
        <p style={{ marginTop: 20 }}>⏳ Initializing WhatsApp…</p>
      )}

      {qrUrl && status === "pending" && (
        <div style={{ marginTop: 30 }}>
          <h3>Scan QR Code</h3>
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: 280,
              height: 280,
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 10
            }}
          />
          <p style={{ marginTop: 10 }}>
            WhatsApp → Linked Devices → Scan QR
          </p>
        </div>
      )}

      {status === "ready" && (
        <div style={{ marginTop: 30, color: "green" }}>
          ✅ Connected successfully! Redirecting…
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, color: "red" }}>
          {error}
        </div>
      )}
    </div>
  );
}
