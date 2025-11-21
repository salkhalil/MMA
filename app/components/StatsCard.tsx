interface StatsCardProps {
  icon: string;
  value: number;
  label: string;
  colorClass: string;
  bgClass: string;
}

export default function StatsCard({
  icon,
  value,
  label,
  colorClass,
  bgClass,
}: StatsCardProps) {
  return (
    <div
      className={`${bgClass} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-slate-700`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

