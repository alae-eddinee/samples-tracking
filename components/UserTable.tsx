"use client";

import { IUser } from "@/types";
import { Pencil, KeyRound, UserCheck, UserX } from "lucide-react";

interface UserTableProps {
  users: IUser[];
  onEdit: (user: IUser) => void;
  onResetPassword: (user: IUser) => void;
  onToggleActive: (user: IUser) => void;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UserTable({ users, onEdit, onResetPassword, onToggleActive }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
        No users yet. Add the first user above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["Name", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={String(user._id)} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                  {user.active ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Edit user"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onResetPassword(user)}
                    className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    title="Reset password"
                  >
                    <KeyRound size={14} />
                  </button>
                  <button
                    onClick={() => onToggleActive(user)}
                    className={`p-1.5 rounded text-gray-400 ${
                      user.active ? "hover:text-red-600 hover:bg-red-50" : "hover:text-green-600 hover:bg-green-50"
                    }`}
                    title={user.active ? "Disable account" : "Enable account"}
                  >
                    {user.active ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
