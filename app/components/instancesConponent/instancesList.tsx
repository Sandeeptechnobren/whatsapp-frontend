"use client";
import { useState } from "react";

type InstanceStatus = "active" | "inactive";

type Instance = {
  id: number;
  name: string;
  status: InstanceStatus;
};

const mockInstances: Instance[] = [
  { id: 1, name: "Alpha-5231", status: "active" },
  { id: 2, name: "Beta-1287", status: "inactive" },
  { id: 3, name: "Gamma-8224", status: "inactive" },
];

export default function InstancesList() {
  const [instances, setInstances] = useState<Instance[]>(mockInstances);

  // Action handlers (replace with API calls)
  const handleAction = (id: number, action: "activate" | "deactivate" | "delete") => {
    if (action === "delete") {
      setInstances((prev) => prev.filter((inst) => inst.id !== id));
    } else {
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === id
            ? {
                ...inst,
                status:
                  action === "activate"
                    ? "active"
                    : action === "deactivate"
                    ? "inactive"
                    : inst.status,
              }
            : inst
        )
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">Your Instances</h2>
      {instances.length === 0 ? (
        <div className="text-gray-500">No instances found.</div>
      ) : (
        <ul className="space-y-4">
          {instances.map((inst) => (
            <li
              key={inst.id}
              className="flex justify-between items-center border-b pb-2 text-teal-700"
            >
              <span className="font-medium">{inst.name}</span>
              <span
                className={`px-2 py-1 rounded-md text-xs font-bold ${
                  inst.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {inst.status}
              </span>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleAction(inst.id, "activate")}
                  className={`px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition ${
                    inst.status === "active" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={inst.status === "active"}
                >
                  Activate
                </button>
                <button
                  onClick={() => handleAction(inst.id, "deactivate")}
                  className={`px-2 py-1 rounded bg-yellow-500 text-white text-xs hover:bg-yellow-600 transition ${
                    inst.status === "inactive" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={inst.status === "inactive"}
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleAction(inst.id, "delete")}
                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
