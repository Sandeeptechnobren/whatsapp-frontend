"use client";

import { Users } from "lucide-react";
import StatCard from "../components/StatCard";

interface InactiveInstances {
  value: number | string;
}

export default function UsersCard({ value }: InactiveInstances) {
  return (
    <StatCard
      title="Inactive Instances"
      value={value}
      Icon={Users}
      iconColor="text-purple-500"
    />
  );
}
