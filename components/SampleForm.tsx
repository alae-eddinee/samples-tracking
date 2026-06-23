"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { ISample, SampleStatus } from "@/types";

interface SampleFormProps {
  initial?: Partial<ISample>;
  id?: string;
}

function toDateInput(date?: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export default function SampleForm({ initial, id }: SampleFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const [form, setForm] = useState({
    client_name: initial?.client_name ?? "",
    sent_date: toDateInput(initial?.sent_date),
    returned_date: toDateInput(initial?.returned_date),
    status: (initial?.status ?? "Sent") as SampleStatus,
    image_url: initial?.image_url ?? "",
    comment: initial?.comment ?? "",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      sent_date: form.sent_date ? new Date(form.sent_date) : undefined,
      returned_date: form.returned_date ? new Date(form.returned_date) : null,
    };

    try {
      const res = await fetch(isEdit ? `/api/samples/${id}` : "/api/samples", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed");
      }

      toast.success(isEdit ? "Sample updated" : "Sample added");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client name *</label>
        <input name="client_name" value={form.client_name} onChange={handleChange} required
          className={inputClass} placeholder="e.g. Acme Corp" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sent date *</label>
          <input type="date" name="sent_date" value={form.sent_date} onChange={handleChange}
            required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Returned date</label>
          <input type="date" name="returned_date" value={form.returned_date} onChange={handleChange}
            className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
          <option value="Sent">Sent</option>
          <option value="Returned">Returned</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
        <ImageUpload
          currentUrl={form.image_url}
          onUpload={(url) => setForm((f) => ({ ...f, image_url: url }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea name="comment" value={form.comment} onChange={handleChange} rows={3}
          className={inputClass} placeholder="Optional notes…" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add sample"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
