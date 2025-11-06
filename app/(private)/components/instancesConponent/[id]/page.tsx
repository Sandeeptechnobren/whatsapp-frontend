"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import { getInstanceDetails, getInstanceQRCode } from "@/app/allapis";
// You can adjust import paths based on your API function locations.

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

  // useEffect(() => {
  //   const token = localStorage.getItem("token") || "";
  //   async function fetchData() {
  //     setLoading(true);
  //     setError("");
  //     try {
  //       const instResponse = await getInstanceDetails(id, token);
  //       setInstance(instResponse.data);
  //       const qrResponse = await getInstanceQRCode(id, token);
  //       setQrCode(qrResponse.data.qr); // Adjust property based on your actual QR API response
  //     } catch (err: unknown) {
  //       setError(err instanceof Error ? err.message : "Something went wrong");
  //     }
  //     setLoading(false);
  //   }
  //   fetchData();
  // }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 w-32 mb-2 rounded"></div>
        <div className="h-40 bg-gray-200 w-80 mb-2 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!instance) {
    return <div className="text-gray-500">Instance not found.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-3 text-blue-600">Instance Details</h2>
      <div className="mb-2">
        <span className="font-bold">Name: </span>
        <span>{instance.name}</span>
      </div>
      <div className="mb-2">
        <span className="font-bold">ID: </span>
        <span>{instance.id}</span>
      </div>
      <div className="mb-4">
        <span className="font-bold">Status: </span>
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${
            instance.status === "active" || instance.status === "ready"
              ? "bg-green-100 text-green-700"
              : instance.status === "disconnected" || instance.status === "error"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {instance.status}
        </span>
      </div>
      <div className="mb-4">
        <span className="font-bold block mb-2">QR Code:</span>
        {qrCode ? (
          <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56 object-contain border rounded bg-gray-50" />
        ) : (
          <span className="text-gray-400">No QR available.</span>
        )}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
        onClick={() => router.back()}
      >
        Back
      </button>
    </div>
  );
}
