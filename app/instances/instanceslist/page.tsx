
'use client';

import { useEffect, useState } from "react";
import { getAllInstances } from "../../allapis";
import { useRouter } from "next/navigation";

interface Instance {
  id: number;
  name: string;
  token: string;
  status: string;
}

export default function InstancesList() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router= useRouter();

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedData = localStorage.getItem("admin");
      if (!storedData) {
        throw new Error("Unauthorized. Please login again.");
      }

      const parsed = JSON.parse(storedData);
      const adminToken = parsed?.adminToken;

      if (!adminToken) {
        throw new Error("Unauthorized. Please login again.");
      }

      const response = await getAllInstances(adminToken);
      console.log("API Response:", response);
      setInstances(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch instances");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Your WhatsApp Instances</h1>

        {loading && <p>Loading instances...</p>}

        {error && <p style={styles.error}>{error}</p>}

        {!loading && instances.length === 0 && (
          <p>No instances found.</p>
        )}

        {!loading && instances.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Token</th>
                </tr>
              </thead>
<tbody>
  {instances.map((instance) => (
    <tr
      key={instance.id}
      style={{ cursor: "pointer" }}
      onClick={()=>router.push(
        instance.status === "pending"? `/instances/${instance.name}/activate`:`/instances/${instance.name}`
      )
      }
    >
      <td>{instance.id}</td>
      <td>{instance.name}</td>
      <td>
        <span
          style={{
            ...styles.status,
            backgroundColor:
              instance.status === "ready"
                ? "#16a34a"
                : "#f59e0b",
          }}
        >
          {instance.status}
        </span>
      </td>
      <td style={{ fontSize: "12px" }}>
        {instance.token}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    padding: "40px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
  },
  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600",
  },
  error: {
    color: "#e11d48",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  status: {
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
  },
};
