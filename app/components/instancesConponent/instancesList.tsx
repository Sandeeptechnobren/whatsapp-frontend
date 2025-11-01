// "use client";
// import { useEffect, useState } from "react";
// import { getAllInstances } from "@/app/allapis";

// type InstanceStatus = "active" | "inactive" | "pending" | "ready" | "disconnected" | "error";

// type Instance = {
//   id: number;
//   name: string;
//   status: InstanceStatus;
// };

// export default function InstancesList() {
//   const [instances, setInstances] = useState<Instance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token") || "";
//     async function fetchData() {
//       setLoading(true);
//       setError("");
//       try {
//         const data = await getAllInstances(token);
//         setInstances(data.data || []);
//       } catch (err: unknown) {
//         setError(err instanceof Error ? err.message : "Something went wrong");
//       }
//       setLoading(false);
//     }
//     fetchData();
//   }, []);

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <h2 className="text-xl font-semibold mb-4 text-blue-600">Your Instances</h2>
//       {loading ? (
//         <ul className="space-y-4 animate-pulse">
//           {Array.from({ length: 3 }).map((_, idx) => (
//             <li
//               key={idx}
//               className="flex justify-between items-center border-b pb-2 text-teal-700"
//             >
//               <span className="bg-gray-200 rounded w-24 h-5 block" />
//               <span className="bg-gray-200 rounded w-20 h-5 block" />
//               <div className="flex gap-2 ml-4">
//                 <span className="bg-gray-200 rounded w-14 h-5 block" />
//               </div>
//             </li>
//           ))}
//         </ul>
//       ) : error ? (
//         <div className="text-red-600">{error}</div>
//       ) : instances.length === 0 ? (
//         <div className="text-gray-500">No instances found.</div>
//       ) : (
//         <ul className="space-y-4">
//           {instances.map((inst) => (
//             <li
//               key={inst.id}
//               className="flex justify-between items-center border-b pb-2 text-teal-700"
//             >
//               <span className="font-medium">{inst.name}</span>
//               <span
//                 className={`px-2 py-1 rounded-md text-xs font-bold ${
//                   inst.status === "active" || inst.status === "ready"
//                     ? "bg-green-100 text-green-700"
//                     : inst.status === "disconnected" || inst.status === "error"
//                     ? "bg-red-100 text-red-700"
//                     : "bg-yellow-100 text-yellow-700"
//                 }`}
//               >
//                 {inst.status}
//               </span>
//               <div className="flex gap-2 ml-4">
//                 {/* Action buttons can go here */}
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllInstances } from "@/app/allapis";
import Link from "next/link";


type InstanceStatus = "active" | "inactive" | "pending" | "ready" | "disconnected" | "error";

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
        const data = await getAllInstances(token);
        setInstances(data.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleInstanceClick = (id: number) => {
    router.push(`/instancesConponent/${id}/page`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">Your Instances</h2>
      {loading ? (
        <ul className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b pb-2 text-teal-700"
            >
              <span className="bg-gray-200 rounded w-24 h-5 block" />
              <span className="bg-gray-200 rounded w-20 h-5 block" />
              <div className="flex gap-2 ml-4">
                <span className="bg-gray-200 rounded w-14 h-5 block" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : instances.length === 0 ? (
        <div className="text-gray-500">No instances found.</div>
      ) : (
        <ul className="space-y-4">
          {instances.map((inst) => (
            <li
              key={inst.id}
              onClick={() => handleInstanceClick(inst.id)}
              className="flex justify-between items-center border-b pb-2 text-teal-700 cursor-pointer hover:bg-blue-50 transition rounded-md px-2"
            >
              <span className="font-medium">{inst.name}</span>
              <span
                className={`px-2 py-1 rounded-md text-xs font-bold ${
                  inst.status === "active" || inst.status === "ready"
                    ? "bg-green-100 text-green-700"
                    : inst.status === "disconnected" || inst.status === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {inst.status}
              </span>
              <div className="flex gap-2 ml-4">
                {/* Future action buttons */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
