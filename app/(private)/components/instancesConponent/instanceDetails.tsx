"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInstanceDetails, getInstanceQRCode } from "@/app/allapis";
import { Loader2, ArrowLeft, QrCode } from "lucide-react";

type InstanceStatus = "active" | "inactive" | "pending" | "ready" | "disconnected" | "error";

type Instance = {
  id: number;
  name: string;
  status: InstanceStatus;
};

export default function InstanceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        // const instResponse = await getInstanceDetails(token, Number(id));
        // setInstance(instResponse?.data);

        const qrResponse = await getInstanceQRCode(token, Number(id));
        setQrCode(qrResponse || "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 mt-3">Loading instance details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto mt-10 shadow">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="text-gray-600 text-center mt-10">
        No instance found with ID <span className="font-semibold">{id}</span>.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg mx-auto mt-10 border border-gray-100">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 text-blue-600">
        <QrCode className="w-6 h-6" /> Instance Details
      </h2>

      <div className="space-y-3">
        <div>
          <span className="font-semibold text-gray-700">Name:</span>{" "}
          <span className="text-gray-900">{instance.name}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">ID:</span>{" "}
          <span className="text-gray-900">{instance.id}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Status:</span>{" "}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              instance.status === "active" || instance.status === "ready"
                ? "bg-green-100 text-green-700"
                : instance.status === "disconnected" || instance.status === "error"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {instance.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-6 text-center">
        {qrCode ? (
          <img
            src={qrCode}
            alt="WhatsApp QR Code"
            className="w-56 h-56 mx-auto border rounded-xl shadow-sm bg-gray-50"
          />
        ) : (
          <p className="text-gray-400">No QR available yet. Try refreshing.</p>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
    </div>
  );
}
