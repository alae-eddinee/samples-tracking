"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IUser } from "@/types";

type Mode = "add" | "edit" | "reset";

interface UserFormModalProps {
  mode: Mode;
  user?: IUser;
  onClose: () => void;
  onSuccess: () => void;
}

const titles: Record<Mode, string> = {
  add: "Add user",
  edit: "Edit user",
  reset: "Reset password",
};

const submitLabels: Record<Mode, string> = {
  add: "Add user",
  edit: "Save changes",
  reset: "Reset password",
};

export default function UserFormModal({ mode, user, onClose, onSuccess }: UserFormModalProps) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "user",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let url = "/api/users";
    let method = "POST";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: Record<string, any> = {};

    if (mode === "add") {
      body = { name: form.name, email: form.email, password: form.password, role: form.role };
    } else if (mode === "edit") {
      url = `/api/users/${user!._id}`;
      method = "PUT";
      body = { name: form.name, email: form.email, role: form.role };
    } else {
      url = `/api/users/${user!._id}`;
      method = "PUT";
      body = { password: form.password };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{titles[mode]}</h2>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {mode !== "reset" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {(mode === "add" || mode === "reset") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : submitLabels[mode]}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
