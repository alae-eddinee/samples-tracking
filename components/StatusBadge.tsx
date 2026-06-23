import { SampleStatus } from "@/types";

const config: Record<SampleStatus, { classes: string; dot: string }> = {
  Sent: { classes: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-400" },
  Returned: { classes: "bg-green-100 text-green-800 border-green-300", dot: "bg-green-500" },
  Lost: { classes: "bg-red-100 text-red-800 border-red-300", dot: "bg-red-500" },
};

export default function StatusBadge({ status }: { status: SampleStatus }) {
  const { classes, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
