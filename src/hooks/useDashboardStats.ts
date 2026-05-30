import { useState, useEffect } from 'react';
import type { DashboardStats } from '../types';
import { API_BASE } from '../constants/translations';

export function useDashboardStats() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_patients: 0,
    avg_los: 0,
    readmission_rate: 0,
    mortality_rate: 0,
    avg_age: 0,
    gender_M: 0,
    gender_F: 0,
    top_diagnoses: [],
    los_distribution: {},
    isLocal: false,
  });

  const [syncStr, setSyncStr] = useState('');
  const [lastSheetSync, setLastSheetSync] = useState('');

  // Restore saved stats from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboardStats');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDashboardStats(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore corrupt data */ }
  }, []);

  async function syncFromSheet() {
    try {
      const res = await fetch(`${API_BASE}/sheet-stats?ts=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const merged = {
        total_patients: (d.total_patients !== undefined && d.total_patients !== null) ? d.total_patients : dashboardStats.total_patients,
        avg_los: (d.avg_los !== undefined && d.avg_los !== null) ? d.avg_los : dashboardStats.avg_los,
        readmission_rate: (d.readmission_rate !== undefined && d.readmission_rate !== null) ? d.readmission_rate : dashboardStats.readmission_rate,
        mortality_rate: (d.mortality_rate !== undefined && d.mortality_rate !== null) ? d.mortality_rate : dashboardStats.mortality_rate,
        avg_age: (d.avg_age !== undefined && d.avg_age !== null) ? d.avg_age : dashboardStats.avg_age,
        gender_M: (d.gender_M !== undefined && d.gender_M !== null) ? d.gender_M : dashboardStats.gender_M,
        gender_F: (d.gender_F !== undefined && d.gender_F !== null) ? d.gender_F : dashboardStats.gender_F,
        top_diagnoses: d.top_diagnoses ?? dashboardStats.top_diagnoses,
        los_distribution: d.los_distribution ?? dashboardStats.los_distribution,
        isLocal: false,
      };
      setDashboardStats(merged);
      localStorage.setItem('dashboardStats', JSON.stringify(merged));
      const synced = new Date();
      const timeStr = synced.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setLastSheetSync(timeStr);
      setSyncStr(`✅ Synchronisé — ${timeStr}`);
    } catch {
      const hasData = dashboardStats.total_patients > 0 || dashboardStats.top_diagnoses.length > 0;
      setSyncStr(hasData ? "⚠️ API hors ligne — Données en cache" : "⚠️ Données par défaut — Chargez votre CSV");
    }
  }

  return {
    dashboardStats,
    setDashboardStats,
    syncStr,
    setSyncStr,
    lastSheetSync,
    setLastSheetSync,
    syncFromSheet,
  };
}
