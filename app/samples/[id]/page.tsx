import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import SampleForm from "@/components/SampleForm";
import StatusBadge from "@/components/StatusBadge";
import { connectDB } from "@/lib/mongodb";
import Sample from "@/lib/models/Sample";
import { ISample } from "@/types";

async function getSample(id: string): Promise<ISample | null> {
  try {
    await connectDB();
    const sample = await Sample.findById(id).lean();
    if (!sample) return null;
    return JSON.parse(JSON.stringify(sample)) as ISample;
  } catch {
    return null;
  }
}

export default async function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await getSample(id);

  if (!sample) notFound();

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{sample.client_name}</h1>
            <StatusBadge status={sample.status} />
          </div>
        </div>

        {sample.image_url && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 mb-6">
            <Image src={sample.image_url} alt="Sample" fill className="object-contain" unoptimized />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit sample</h2>
          <SampleForm initial={sample} id={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
