import { useState, useCallback } from 'react';
import type { Alert } from '../types';

type Severity = Alert['severity'];

function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addAlert = useCallback((severity: Severity, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const time = formatTime(new Date());
    setAlerts(prev => [{ id, severity, message, time }, ...prev]);
    setVisibleToasts(prev => [...prev, id]);
  }, []);

  // X button on toast: hide toast only, keep in bell
  const dismissToast = useCallback((id: string) => {
    setVisibleToasts(prev => prev.filter(v => v !== id));
  }, []);

  // "Clear all" or full remove
  const dismissAlert = useCallback((id: string) => {
    setVisibleToasts(prev => prev.filter(v => v !== id));
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const unreadAlerts = alerts.length;

  function getAlertSeverityLevel(sev: string): 'critical' | 'warning' | 'info' {
    if (sev === 'CRITIQUE') return 'critical';
    if (sev === 'AVERTISSEMENT' || sev === 'ATTENTION') return 'warning';
    return 'info';
  }

  return {
    alerts, setAlerts,
    visibleToasts,
    showNotifications, setShowNotifications,
    unreadAlerts,
    addAlert,
    dismissToast,
    dismissAlert,
    getAlertSeverityLevel,
  };
}
