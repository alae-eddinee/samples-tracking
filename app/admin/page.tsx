"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Users, FileText, Package, Send, RotateCcw, AlertTriangle, UserCheck2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import UserTable from "@/components/UserTable";
import AuditLogTable from "@/components/AuditLogTable";
import UserFormModal from "@/components/UserFormModal";
import { IUser } from "@/types";

type Tab = "users" | "logs";
type ModalState = { mode: "add" | "edit" | "reset"; user?: IUser } | null;

interface Stats {
  total: number;
  sent: number;
  returned: number;
  lost: number;
  totalUsers: number;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, returned: 0, lost: 0, totalUsers: 0 });
  const [users, setUsers] = useState<IUser[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  const fetchStats = useCallback(async () => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(console.error);
  }, []);

  const fetchUsers = useCallback(async () => {
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  async function handleToggleActive(user: IUser) {
    const action = user.active ? "disable" : "enable";
    if (!confirm(`${user.active ? "Disable" : "Enable"} ${user.name}?`)) return;

    const res = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });

    if (res.ok) {
      toast.success(`User ${action}d successfully`);
      fetchUsers();
      fetchStats();
    } else {
      toast.error("Failed to update user");
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "users", label: "Users", icon: Users },
    { id: "logs", label: "Audit Logs", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users and view audit logs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Samples" value={stats.total} icon={<Package size={16} />} />
          <StatCard label="Sent" value={stats.sent} icon={<Send size={16} />} accent="yellow" />
          <StatCard label="Returned" value={stats.returned} icon={<RotateCcw size={16} />} accent="green" />
          <StatCard label="Lost" value={stats.lost} icon={<AlertTriangle size={16} />} accent="red" />
          <StatCard label="Active Users" value={stats.totalUsers} icon={<UserCheck2 size={16} />} accent="blue" />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setModal({ mode: "add" })}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus size={15} />
                Add user
              </button>
            </div>
            <UserTable
              users={users}
              onEdit={(user) => setModal({ mode: "edit", user })}
              onResetPassword={(user) => setModal({ mode: "reset", user })}
              onToggleActive={handleToggleActive}
            />
          </div>
        )}

        {tab === "logs" && <AuditLogTable />}
      </div>

      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSuccess={() => {
            const msg = modal.mode === "add" ? "User added" : modal.mode === "edit" ? "User updated" : "Password reset";
            toast.success(msg);
            fetchUsers();
          }}
        />
      )}
    </DashboardLayout>
  );
}
