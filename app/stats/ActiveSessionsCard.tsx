"use client";

import { Phone } from "lucide-react";
import StatCard from "../components/StatCard";
import { log } from "console";

interface ActiveSessionsCardProps {
  value: number | string;
}

export default function ActiveSessionsCard({ value }: ActiveSessionsCardProps) {
  return (
    <StatCard
      title="Total Instances"
      value={value ?? "N/A"}
      Icon={Phone}
      iconColor="text-green-500"
    />
  );
}
