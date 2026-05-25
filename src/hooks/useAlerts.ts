import { useState } from 'react';
import type { Alert } from '../types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadAlerts = alerts.length;

  function dismissAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  function getAlertSeverityLevel(sev: string): 'critical' | 'warning' | 'info' {
    if (sev === 'CRITIQUE') return 'critical';
    if (sev === 'ATTENTION' || sev === 'AVERTISSEMENT') return 'warning';
    return 'info';
  }

  function addAlert(severity: 'CRITIQUE'|'ATTENTION'|'AVERTISSEMENT'|'INFO', message: string) {
    setAlerts(prev => [{
      id: Date.now().toString() + Math.random().toString(),
      severity,
      message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }, ...prev]);
  }

  return {
    alerts,
    setAlerts,
    showNotifications,
    setShowNotifications,
    unreadAlerts,
    dismissAlert,
    getAlertSeverityLevel,
    addAlert,
  };
}
