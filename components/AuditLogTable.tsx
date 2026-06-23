"use client";

import { useState, useEffect, useCallback } from "react";
import { ILog } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE_SAMPLE: "bg-blue-100 text-blue-800",
  UPDATE_SAMPLE: "bg-yellow-100 text-yellow-800",
  UPDATE_STATUS: "bg-orange-100 text-orange-800",
  DELETE_SAMPLE: "bg-red-100 text-red-800",
  ADD_USER: "bg-green-100 text-green-800",
  EDIT_USER: "bg-yellow-100 text-yellow-800",
  RESET_PASSWORD: "bg-purple-100 text-purple-800",
  DISABLE_USER: "bg-red-100 text-red-800",
  ENABLE_USER: "bg-green-100 text-green-800",
};

const ALL_ACTIONS = Object.keys(ACTION_COLORS);

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLogTable() {
  const [logs, setLogs] = useState<ILog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: "", dateFrom: "", dateTo: "" });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filters.action) params.set("action", filters.action);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);

    try {
      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  const hasFilters = filters.action || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.action}
          onChange={(e) => setFilter("action", e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All actions</option>
          {ALL_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="date" value={filters.dateFrom}
          onChange={(e) => setFilter("dateFrom", e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="From date"
        />
        <input type="date" value={filters.dateTo}
          onChange={(e) => setFilter("dateTo", e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="To date"
        />
        {hasFilters && (
          <button
            onClick={() => { setFilters({ action: "", dateFrom: "", dateTo: "" }); setPage(1); }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["User", "Action", "Target", "Date / Time"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No audit logs found.</td></tr>
            ) : logs.map((log) => (
              <tr key={String(log._id)} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{log.user_name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.target_label}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} entr{total === 1 ? "y" : "ies"}</p>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600 px-1">{page} / {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
