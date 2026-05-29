import { useState, useCallback } from 'react';
import type { Alert } from '../types';
import { useToast } from './useToast';

type Severity = Alert['severity'];

const severityToastType: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  CRITIQUE: 'error',
  ATTENTION: 'warning',
  AVERTISSEMENT: 'warning',
  INFO: 'info',
};

function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { addToast } = useToast();

  const addAlert = useCallback((severity: Severity, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const time = formatTime(new Date());
    setAlerts(prev => [{ id, severity, message, time }, ...prev]);
    addToast(severityToastType[severity] || 'info', message);
  }, [addToast]);

  const dismissAlert = useCallback((id: string) => {
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
    showNotifications, setShowNotifications,
    unreadAlerts,
    addAlert,
    dismissAlert,
    getAlertSeverityLevel,
  };
}
