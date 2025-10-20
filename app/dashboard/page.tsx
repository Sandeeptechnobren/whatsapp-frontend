"use client";
import React, { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import ApiUsage from "../components/ApiUsage";
import ApiKey from "../components/ApiKey";
import RecentActivity from "../components/RecentActivity";
import ActiveSessionsCard from "../stats/ActiveSessionsCard";
import MessagesCard from "../stats/MessagesCard";
import UsersCard from "../stats/UsersCard";
import { instancesStatistics } from "../allapis";

interface StatusBreakdown {
  pending: number;
  ready: number;
  disconnected: number;
  error: number;
}
interface Stats {
  totalInstances: number;
  statusBreakdown: StatusBreakdown;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalInstances: 0,
    statusBreakdown: {
      pending: 0,
      ready: 0,
      disconnected: 0,
      error: 0,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    instancesStatistics(token)
      .then((data) => {
        // If your API returns { data: { ...stats } }, extract as needed.
        if (data && data.totalInstances !== undefined) {
          setStats(data);
        } else if (data && data.data) {
          setStats(data.data);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Failed to fetch instance stats:", err.message);
        } else {
          console.error("Failed to fetch instance stats:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ActiveSessionsCard value={stats.totalInstances} />
          <MessagesCard value={stats.statusBreakdown.ready ?? 0} />
          <UsersCard
            value={
              (stats.statusBreakdown.pending ?? 0) +
              (stats.statusBreakdown.ready ?? 0)
            }
          />
        </section>

        {/* API / Integration Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ApiUsage />
          <ApiKey />
        </section>

        {/* Logs / Activity */}
        <RecentActivity />
      </main>
    </div>
  );
}
