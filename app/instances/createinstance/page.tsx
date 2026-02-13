'use client';

import { useState } from "react";
// import { createInstance } from "@/lib/api"; // adjust path if needed
import { createInstance } from "../../allapis"; // adjust path if needed

export default function CreateInstancePage() {
  const [instanceName, setInstanceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
const handleCreateInstance = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!instanceName.trim()) {
    setError("Instance name is required");
    return;
  }

  try {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const storedUser = localStorage.getItem("admin");
    if (!storedUser) {
        throw new Error("User not found");
    }

    const adminToken = storedUser?JSON.parse(storedUser).adminToken:null;
    console.log(adminToken);
    if (!adminToken) {
      throw new Error("Admin token missing");
    }

    const response = await createInstance(adminToken,instanceName );

    setSuccessMessage(`Instance "${response.instance_name}" created successfully!`);
    setInstanceName("");
  } catch (err: any) {
    setError(err.message || "Failed to create instance");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create New WhatsApp Instance</h1>

        <form onSubmit={handleCreateInstance} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Instance Name</label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="Enter instance name"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Instance"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
          {successMessage && <p style={styles.success}>{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "450px",
  },
  title: {
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "500",
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    transition: "0.2s ease",
  },
  error: {
    color: "#e11d48",
    fontSize: "14px",
  },
  success: {
    color: "#16a34a",
    fontSize: "14px",
  },
};
