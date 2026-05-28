import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import type { Alert } from '../types';
import { useEffect, useRef } from 'react';

interface AlertsBannerProps {
  visibleToasts: string[];
  allAlerts: Alert[];
  dismissToast: (id: string) => void;
  navbarH: number;
  statusBarH: number;
  getAlertSeverityLevel: (sev: string) => 'critical' | 'warning' | 'info';
}

export default function AlertsBanner({
  visibleToasts,
  allAlerts,
  dismissToast,
  navbarH,
  statusBarH,
  getAlertSeverityLevel,
}: AlertsBannerProps) {
  const visibleAlerts = allAlerts
    .filter(alert => visibleToasts.includes(alert.id))
    .slice(0, 3);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    // Clean up timers for IDs that are no longer visible
    timersRef.current.forEach((timer, id) => {
      if (!visibleToasts.includes(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    });
    // Set (or reset) a timer for each visible toast
    visibleToasts.forEach(id => {
      const existing = timersRef.current.get(id);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => dismissToast(id), 4000);
      timersRef.current.set(id, timer);
    });
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [visibleToasts, dismissToast]);

  if (visibleAlerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
      className="fixed z-[998] flex flex-col gap-2 p-3"
      style={{
        top: navbarH + statusBarH + 'px',
        right: '16px',
        maxWidth: '380px',
      }}
    >
      <AnimatePresence mode="sync">
        {visibleAlerts.map((alert, i) => {
          const level = getAlertSeverityLevel(alert.severity);
          const bgClass =
            level === 'critical'
              ? 'bg-[#2A0A0A] border-l-4 border-[#D64545] text-white'
              : level === 'warning'
              ? 'bg-[#2A1A00] border-l-4 border-[#FF8C00] text-white'
              : 'bg-[#0A2A20] border-l-4 border-[#00D4AA] text-white';
          const iconColor =
            level === 'critical'
              ? 'text-[#D64545]'
              : level === 'warning'
              ? 'text-[#FF8C00]'
              : 'text-[#00D4AA]';
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-2xl ${bgClass}`}
            >
              <AlertTriangle className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <div className="flex-1 flex flex-col">
                <span className="font-medium">{alert.severity}</span>
                <span className="text-xs opacity-80">{alert.message}</span>
              </div>
              <span className="text-xs opacity-80 mr-1">{alert.time}</span>
              <button
                onClick={() => dismissToast(alert.id)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
