
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  change?: number;
  color: 'brand' | 'success' | 'warning' | 'danger';
  description?: string;
}

const colorMap = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

export default function MetricCard({
  title,
  value,
  suffix,
  change,
  color,
  description,
}: MetricCardProps) {
  const trendLabel =
    change === undefined ? null : change > 0 ? '▲' : change < 0 ? '▼' : '—';

  const trendColor =
    change === undefined
      ? ''
      : change > 0
      ? 'text-success-700 bg-success-50'
      : change < 0
      ? 'text-danger-700 bg-danger-50'
      : 'text-gray-500 bg-gray-100';

  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('px-2.5 py-1 rounded-xl text-xs font-semibold', colorMap[color])}>
          {title}
        </div>
        {change !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              trendColor
            )}
          >
            {trendLabel}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>

      {description && (
        <p className="text-xs text-gray-400 mt-2">{description}</p>
      )}
    </div>
  );
}
