import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import type { Alert } from '../types';

interface AlertsBannerProps {
  alerts: Alert[];
  navbarH: number;
  statusBarH: number;
  dismissAlert: (id: string) => void;
  getAlertSeverityLevel: (sev: string) => 'critical' | 'warning' | 'info';
}

export default function AlertsBanner({ alerts, navbarH, statusBarH, dismissAlert, getAlertSeverityLevel }: AlertsBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed left-0 right-0 z-[998] flex flex-col gap-2 p-3"
      style={{ top: navbarH + statusBarH + 'px' }}
    >
      {alerts.map(alert => {
        const level = getAlertSeverityLevel(alert.severity);
        const bgClass = level === 'critical' ? 'bg-[#D64545]/95 border-[#D64545] animate-pulse' : level === 'warning' ? 'bg-[#FF8C00]/95 border-[#FF8C00]' : 'bg-[#38A8D4]/95 border-[#38A8D4]';
        const iconColor = level === 'critical' ? 'text-[#D64545]' : level === 'warning' ? 'text-[#FF8C00]' : 'text-[#38A8D4]';
        return (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border backdrop-blur-sm ${bgClass} text-white text-sm`}
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <span className="flex-1 font-medium">{alert.message}</span>
            <span className="text-xs opacity-80">{alert.time}</span>
            <button onClick={() => dismissAlert(alert.id)} className="ml-2 hover:opacity-70 transition-opacity">
              ✕
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
