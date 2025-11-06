"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllInstances } from "@/app/allapis";
import { Server, AlertCircle, Loader2 } from "lucide-react";

type InstanceStatus =
  | "active"
  | "inactive"
  | "pending"
  | "ready"
  | "disconnected"
  | "error";

type Instance = {
  id: number;
  name: string;
  status: InstanceStatus;
};

export default function InstancesList() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await getAllInstances(token);
        console.log("Fetched instances:", res);

        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        setInstances(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleInstanceClick = (id: number) => {
    router.push(`/instancesConponent/${id}`);
  };

  const getStatusColor = (status: InstanceStatus) => {
    switch (status) {
      case "active":
      case "ready":
        return "bg-green-100 text-green-700";
      case "disconnected":
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 transition-all relative overflow-x-auto">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-blue-600">Your Instances</h2>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-100 rounded-lg p-3"
            >
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && instances.length === 0 && (
        <div className="text-gray-500 text-center py-10">
          <Server className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>No instances found. Try creating one!</p>
        </div>
      )}

      {/* Row-based List View */}
      {!loading && !error && instances.length > 0 && (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Instance Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {instances.map((inst) => (
              <tr
                key={inst.id}
                className="hover:bg-blue-50 transition cursor-pointer"
                onClick={() => handleInstanceClick(inst.id)}
              >
                <td className="px-4 py-3 font-mono text-gray-600">{inst.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {inst.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${getStatusColor(
                      inst.status
                    )}`}
                  >
                    {inst.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstanceClick(inst.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Loader Overlay (optional) */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  );
}
