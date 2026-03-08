import type { BottleneckAlert as BottleneckAlertType } from '../../types';
import clsx from 'clsx';

interface BottleneckAlertProps {
  alerts: BottleneckAlertType[];
}

const severityConfig = {
  critical: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    label: '긴급',
    labelBg: 'bg-danger-500',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    label: '주의',
    labelBg: 'bg-warning-500',
  },
  info: {
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    label: '참고',
    labelBg: 'bg-brand-500',
  },
};

export default function BottleneckAlert({ alerts }: BottleneckAlertProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title">조직 병목 알림</h3>
          <p className="section-subtitle">AI가 감지한 조직 내 주요 이슈</p>
        </div>
        <span className="badge-warning">{alerts.length}건</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];

          return (
            <div
              key={alert.id}
              className={clsx(
                'p-4 rounded-xl border animate-fade-in',
                config.bg,
                config.border
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold text-white',
                      config.labelBg
                    )}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    영향 인원 {alert.affectedUsers}명
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1.5">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-600">{alert.suggestion}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
