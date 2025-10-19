
// "use client";

// import { Phone, MessageSquare, Users } from "lucide-react";
// import StatCard from "../components/StatCard";
// import ApiUsage from "../components/ApiUsage";
// import ApiKey from "../components/ApiKey";
// import RecentActivity from "../components/RecentActivity";
// import ActiveSessionsCard from "../stats/ActiveSessionsCard";
// import MessagesCard from "../stats/MessagesCard";
// import UsersCard from "../stats/UsersCard";
// import {instancesStatistics} from "../allapis";
// import { useEffect } from "react";

// export default function Dashboard() {
//   const [stats, setStats] = useState({
//     totalInstances: 0,
//     statusBreakdown: {
//       pending: 0,
//       ready: 0,
//       disconnected: 0,
//       error: 0,
//     },
//   });
//   useEffect(() => {
//     const token = localStorage.getItem("token"); // or your auth storage
//     if (!token) return;

//     instancesStatistics(token)
//       .then((data) => {
//         if (data) setStats(data);
//       })
//       .catch((err) => console.error("Failed to fetch instance stats:", err));
//   }, []);

// export default function DashboardPage() {
//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <main className="flex-1 p-6 overflow-y-auto">
        
//         {/* Quick Stats */}
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           {/* <StatCard title="Active Sessions" value={3} Icon={Phone} iconColor="text-green-500" />
//           <StatCard title="Total Messages" value="1,245" Icon={MessageSquare} iconColor="text-blue-500" />
//           <StatCard title="Connected Users" value={58} Icon={Users} iconColor="text-purple-500" /> */}
//           <ActiveSessionsCard />
//           <MessagesCard />
//           <UsersCard />
//         </section>

//         {/* API / Integration Info */}
//         <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <ApiUsage />
//           <ApiKey />
//         </section>

//         {/* Logs / Activity */}
//         <RecentActivity />

//       </main>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { Phone, MessageSquare, Users } from "lucide-react";
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

    instancesStatistics(token)
      .then((data) => {
        if (data) setStats(data);
      })

      .catch((err) =>
        console.error("Failed to fetch instance stats:", err)
      );
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ActiveSessionsCard value={stats?.data?.totalInstances} />
        <MessagesCard value={stats?.data?.statusBreakdown?.ready ?? 0} />
        <UsersCard
          value={
            (stats?.data?.statusBreakdown?.pending ?? 0) +
            (stats?.data?.statusBreakdown?.ready ?? 0)
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


