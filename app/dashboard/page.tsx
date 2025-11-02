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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100">
      {/* Header Section */}
      <header className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">Dashboard Overview</h1>
        <p className="text-sm opacity-80 mt-1">
          Monitor your active sessions, API usage, and recent activities.
        </p>
      </header>

      {/* Main Section */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid"></div>
          </div>
        )}

        {/* Quick Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <ActiveSessionsCard value={stats.totalInstances} />
          <MessagesCard value={stats.statusBreakdown.ready ?? 0} />
          <UsersCard
            value={
              (stats.statusBreakdown.pending ?? 0) +
              (stats.statusBreakdown.ready ?? 0)
            }
          />
        </section>

        {/* API / Integration Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <ApiUsage />
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <ApiKey />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Recent Activity
          </h2>
          <RecentActivity />
        </section>
      </main>
    </div>
  );
}
