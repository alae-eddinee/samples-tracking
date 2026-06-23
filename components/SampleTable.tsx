"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, ChevronsUpDown, Plus } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { ISample } from "@/types";

type SortField = "client_name" | "status" | "sent_date" | "returned_date";
type SortDir = "asc" | "desc";

function formatDate(date?: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown size={13} className="text-gray-400" />;
  return sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
}

export default function SampleTable() {
  const router = useRouter();
  const [samples, setSamples] = useState<ISample[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: "sent_date", dir: "desc" });
  const [filters, setFilters] = useState({ status: "all", client: "", dateFrom: "", dateTo: "" });

  const fetchSamples = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.client) params.set("client", filters.client);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    try {
      const res = await fetch(`/api/samples?${params}`);
      setSamples(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSamples(); }, [fetchSamples]);

  function toggleSort(field: SortField) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));
  }

  const sorted = [...samples].sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[sort.field] ?? "");
    const bv = String((b as unknown as Record<string, unknown>)[sort.field] ?? "");
    return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Delete this sample? This cannot be undone.")) return;
    const res = await fetch(`/api/samples/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Sample deleted");
      fetchSamples();
    } else {
      toast.error("Failed to delete sample");
    }
    router.refresh();
  }

  const hasFilters = filters.status !== "all" || filters.client || filters.dateFrom || filters.dateTo;

  function ColHeader({ field, label }: { field: SortField; label: string }) {
    return (
      <th className="px-4 py-3">
        <button
          onClick={() => toggleSort(field)}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide hover:text-gray-900"
        >
          {label}
          <SortIcon field={field} sortField={sort.field} sortDir={sort.dir} />
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-200 rounded-xl">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="Sent">Sent</option>
          <option value="Returned">Returned</option>
          <option value="Lost">Lost</option>
        </select>
        <input type="text" placeholder="Filter by client…" value={filters.client}
          onChange={(e) => setFilters((f) => ({ ...f, client: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
        />
        <input type="date" value={filters.dateFrom} title="Sent from"
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input type="date" value={filters.dateTo} title="Sent to"
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {hasFilters && (
          <button onClick={() => setFilters({ status: "all", client: "", dateFrom: "", dateTo: "" })}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">Image</th>
              <ColHeader field="client_name" label="Client" />
              <ColHeader field="status" label="Status" />
              <ColHeader field="sent_date" label="Sent" />
              <ColHeader field="returned_date" label="Returned" />
              <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">Comment</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading…</td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus size={24} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">No samples yet</p>
                      <p className="text-sm mt-0.5">
                        {hasFilters ? "Try adjusting your filters" : "Add your first sample to get started"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((s) => (
                <tr
                  key={String(s._id)}
                  onClick={() => router.push(`/samples/${s._id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {s.image_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                        <Image src={s.image_url} alt="Sample" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.client_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.sent_date)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.returned_date)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{s.comment || "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Link href={`/samples/${s._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </Link>
                      <button onClick={(e) => handleDelete(e, String(s._id))}
                        className="text-sm text-red-500 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">{sorted.length} sample{sorted.length !== 1 ? "s" : ""} found</p>
    </div>
  );
}
