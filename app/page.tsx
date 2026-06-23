import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardStats from "@/components/DashboardStats";
import SampleTable from "@/components/SampleTable";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track physical samples sent to clients</p>
          </div>
          <Link
            href="/samples/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Add sample
          </Link>
        </div>
        <DashboardStats />
        <SampleTable />
      </div>
    </DashboardLayout>
  );
}
