import { useState, useEffect } from 'react';
import type { DashboardStats } from '../types';
import { API_BASE } from '../constants/translations';

export function useDashboardStats() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_patients: 4506,
    avg_los: 7.43,
    readmission_rate: 11.2,
    mortality_rate: 4.2,
    avg_age: 63,
    gender_M: 54,
    gender_F: 46,
    top_diagnoses: [
      { name: 'Septicémie', count: 312 },
      { name: 'Insuffisance Cardiaque', count: 287 },
      { name: 'Pneumonie', count: 198 },
      { name: 'IRC', count: 176 },
      { name: 'AVC', count: 154 },
    ],
    los_distribution: {
      '<2 j': 18,
      '2-7 j': 41,
      '7-14 j': 28,
      '>14 j': 13,
    },
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
      setDashboardStats(prev => ({
        ...prev,
        total_patients: (d.total_patients !== undefined && d.total_patients !== null && d.total_patients !== 0) ? d.total_patients : prev.total_patients,
        avg_los: (d.avg_los !== undefined && d.avg_los !== null && d.avg_los !== 0) ? d.avg_los : prev.avg_los,
        readmission_rate: (d.readmission_rate !== undefined && d.readmission_rate !== null && d.readmission_rate !== 0) ? d.readmission_rate : prev.readmission_rate,
        mortality_rate: (d.mortality_rate !== undefined && d.mortality_rate !== null && d.mortality_rate !== 0) ? d.mortality_rate : (prev.mortality_rate ?? 4.2),
        avg_age: (d.avg_age !== undefined && d.avg_age !== null && d.avg_age !== 0) ? d.avg_age : prev.avg_age,
        gender_M: (d.gender_M !== undefined && d.gender_M !== null && d.gender_M !== 0) ? d.gender_M : prev.gender_M,
        gender_F: (d.gender_F !== undefined && d.gender_F !== null && d.gender_F !== 0) ? d.gender_F : prev.gender_F,
        top_diagnoses: d.top_diagnoses ?? prev.top_diagnoses,
        los_distribution: d.los_distribution ?? prev.los_distribution,
        isLocal: false,
      }));
      const synced = new Date();
      const timeStr = synced.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setLastSheetSync(timeStr);
      setSyncStr(`✅ Synchronisé — ${timeStr}`);
    } catch {
      setSyncStr("⚠️ Données par défaut — Chargez votre CSV");
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
