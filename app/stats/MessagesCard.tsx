"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import StatCard from "../components/StatCard";

interface ActiveInstances{
  value :number|string;
}

export default function MessagesCard({value}:ActiveInstances) {
  return <StatCard title="Active Instances" value={value} Icon={MessageSquare} iconColor="text-blue-500" />;
}
