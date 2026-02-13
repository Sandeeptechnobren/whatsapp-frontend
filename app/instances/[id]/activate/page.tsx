
// 'use client';

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { startInstance, getQRpng } from "../../../allapis";

// export default function ActivateInstance() {
//   const params = useParams();
//   const instanceName = params.id as string;

//   const [loading, setLoading] = useState(false);
//   const [activated, setActivated] = useState(false);
//   const [qrUrl, setQrUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const getAdminToken = () => {
//     const stored = localStorage.getItem("admin");
//     if (!stored) throw new Error("Unauthorized. Please login again.");

//     const parsed = JSON.parse(stored);
//     if (!parsed?.adminToken)
//       throw new Error("Unauthorized. Please login again.");

//     return parsed.adminToken;
//   };

//   const handleActivate = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = getAdminToken();
//       await startInstance(token, instanceName);
//       setTimeout(() => {
//         setActivated(true);
//         fetchQR();
//       }, 10000);

//     } catch (err: any) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };
//   const fetchQR = async () => {
//     try {
//       const token = getAdminToken();
//       const blob = await getQRpng(token, instanceName);

//       const imageUrl = URL.createObjectURL(blob);
//       setQrUrl(imageUrl);
//       setLoading(false);

//     } catch (err: any) {
//       setError("Failed to fetch QR");
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     if (!activated) return;

//     const interval = setInterval(() => {
//       fetchQR();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, [activated]);

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>Instance Activation</h1>
//       <p><b>Instance Name:</b> {instanceName}</p>

//       {!activated && (
//         <button
//           onClick={handleActivate}
//           disabled={loading}
//           style={{
//             padding: "12px 20px",
//             background: "#2563eb",
//             color: "white",
//             border: "none",
//             borderRadius: 8,
//             cursor: "pointer",
//             fontSize: 16,
//             marginBottom: 20
//           }}
//         >
//           {loading ? "Starting..." : "Start Instance"}
//         </button>
//       )}

//       {loading && (
//         <div style={{ marginTop: 20 }}>
//           ⏳ Starting instance... Please wait 10 seconds
//         </div>
//       )}

//       {qrUrl && (
//         <div style={{ marginTop: 30 }}>
//           <h3>Scan QR to Connect WhatsApp</h3>
//           <img
//             src={qrUrl}
//             alt="QR Code"
//             style={{
//               width: 300,
//               height: 300,
//               border: "1px solid #ddd",
//               padding: 10,
//               borderRadius: 10
//             }}
//           />
//           <p style={{ marginTop: 10 }}>
//             QR auto-refreshes every 10 seconds
//           </p>
//         </div>
//       )}

//       {error && (
//         <div style={{ marginTop: 20, color: "red" }}>
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../allapis";

export default function ActivateInstance() {
  const params = useParams();
  const router = useRouter();
  const instanceName = params.id as string;

  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);

  /* ===============================
     🔐 Get Admin Token
  =============================== */
  const getAdminToken = () => {
    const stored = localStorage.getItem("admin");
    if (!stored) throw new Error("Unauthorized. Please login again.");

    const parsed = JSON.parse(stored);
    if (!parsed?.adminToken)
      throw new Error("Unauthorized. Please login again.");

    return parsed.adminToken;
  };

  /* ===============================
     🚀 CONNECT INSTANCE
  =============================== */
  const connectInstance = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus("pending");

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

      // Backend returns PNG directly
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrUrl(imageUrl);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setStatus("idle");
    }
  };

  /* ===============================
     🔁 CHECK STATUS (AUTO)
  =============================== */
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
        setLoading(false);
        setQrUrl(null);

        // Redirect to instance dashboard
        setTimeout(() => {
          router.push(`/instances/${instanceName}`);
        }, 1500);
      }

    } catch (err) {
      console.log("Status check error");
    }
  };

  /* ===============================
     🔄 AUTO STATUS POLLING
  =============================== */
  useEffect(() => {
    if (status !== "pending") return;

    const interval = setInterval(() => {
      checkStatus();
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, [status]);

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

      {loading && status === "pending" && (
        <div style={{ marginTop: 20 }}>
          <p>⏳ Waiting for QR generation...</p>
        </div>
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
            Scan this QR using WhatsApp → Linked Devices
          </p>
        </div>
      )}

      {status === "ready" && (
        <div style={{ marginTop: 30, color: "green" }}>
          ✅ Connected Successfully! Redirecting...
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
