interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: "yellow" | "green" | "red" | "blue" | "purple";
}

const accents: Record<string, string> = {
  yellow: "border-l-4 border-l-yellow-400",
  green: "border-l-4 border-l-green-400",
  red: "border-l-4 border-l-red-400",
  blue: "border-l-4 border-l-blue-400",
  purple: "border-l-4 border-l-purple-400",
};

export default function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${accent ? accents[accent] : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
