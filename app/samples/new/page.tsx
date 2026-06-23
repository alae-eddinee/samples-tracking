import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import SampleForm from "@/components/SampleForm";

export default function NewSamplePage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Add new sample</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SampleForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
