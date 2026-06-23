"use client";

import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { Package, Send, RotateCcw, AlertTriangle } from "lucide-react";

interface Stats {
  total: number;
  sent: number;
  returned: number;
  lost: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, returned: 0, lost: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Samples" value={stats.total} icon={<Package size={18} />} />
      <StatCard label="Sent" value={stats.sent} icon={<Send size={18} />} accent="yellow" />
      <StatCard label="Returned" value={stats.returned} icon={<RotateCcw size={18} />} accent="green" />
      <StatCard label="Lost" value={stats.lost} icon={<AlertTriangle size={18} />} accent="red" />
    </div>
  );
}
