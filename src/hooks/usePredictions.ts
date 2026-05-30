import React, { useState } from 'react';
import type { Predictions, DashboardStats, FormData } from '../types';
import { API_BASE } from '../constants/translations';
import { useToast } from './useToast';

interface UsePredictionsParams {
  dashboardStats: DashboardStats;
  formData: FormData;
  t: any;
  addAlert: (severity: any, message: string) => void;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
}

export function usePredictions({ dashboardStats, formData, t, addAlert, setErrorMsg }: UsePredictionsParams) {
  const { addToast } = useToast();
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [readmitResult, setReadmitResult] = useState<{ risk?: number; message?: string } | null>(null);
  const [isPredictingReadmit, setIsPredictingReadmit] = useState(false);

  const getSeason = (): string => {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return "Spring";
    if (m >= 6 && m <= 8) return "Summer";
    if (m >= 9 && m <= 11) return "Autumn";
    return "Winter";
  };

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setIsPredicting(true);
    setErrorMsg('');
    setPredictions(null);
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const total = dashboardStats.total_patients || 1;
    const reqHeaders = { 'Content-Type': 'application/json' };
    const loadPayload = {
      day_of_week: now.getDay(),
      month: now.getMonth() + 1,
      day_of_year: dayOfYear,
      is_weekend: [0, 6].includes(now.getDay()) ? 1 : 0,
      lag_1: total / 30,
      lag_7: total / 30 * 7,
      rolling_mean_3: total / 30,
      rolling_mean_7: total / 30 * 7,
      rolling_std_7: Math.sqrt(total / 30),
    };
    const genderCode = formData.gender === 'Femme' ? 'F' : 'M';
    const vitalRisk = Math.min(3, (
      (formData.heartrate > 100 ? 1 : 0) +
      (formData.sbp < 90 ? 1 : 0) +
      (formData.o2sat < 90 ? 1 : 0)
    ));
    const losPayload = {
      anchor_age: formData.age,
      num_diagnoses: 3,
      charlson_proxy_score: Math.min(10, (formData.age / 20) + 1),
      icu_los_hours: 0,
      num_icu_stays: 0,
      ed_los_hours: 3.0,
      ed_acuity: vitalRisk > 1 ? 3.0 : 2.0,
      surgical_flag: 0,
      vital_risk_score: vitalRisk,
      weekend_admit: 0,
      night_admit: 0,
      high_los_risk: 0,
      gender: genderCode,
      admission_type: "URGENT",
      insurance: "Medicare",
      first_careunit: "No ICU",
      primary_service: "MED",
      season: getSeason(),
      age_group: formData.age >= 65 ? '65+' : formData.age >= 40 ? '40-64' : '18-39',
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const [loadRes, losRes, triageRes] = await Promise.allSettled([
        fetch(`${API_BASE}/predict/load`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(loadPayload), signal: controller.signal }),
        fetch(`${API_BASE}/predict/los`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(losPayload), signal: controller.signal }),
        fetch(`${API_BASE}/predict/triage`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(formData), signal: controller.signal }),
      ]);
      clearTimeout(timeout);
      let loadVal: number | undefined, losVal: number | undefined, triageVal: number | undefined, isUrgentVal: number | undefined, urgencyScoreVal: number | undefined;
      if (loadRes.status === 'fulfilled' && loadRes.value.ok) {
        const d = await loadRes.value.json();
        loadVal = typeof d === 'number' ? d : d.predicted_admissions;
      }
      if (losRes.status === 'fulfilled' && losRes.value.ok) {
        const d = await losRes.value.json();
        losVal = typeof d === 'number' ? d : d.predicted_los_days;
      }
      if (triageRes.status === 'fulfilled' && triageRes.value.ok) {
        const d = await triageRes.value.json();
        const prob = d.urgency_probability ?? 0;
        const level = d.level ?? 'NORMAL';
        triageVal = level === 'CRITICAL' ? 1 : level === 'WATCH' ? 2 : 3;
        isUrgentVal = level === 'CRITICAL' ? 1 : 0;
        urgencyScoreVal = prob;
      }
      setPredictions({ load: loadVal, los: losVal, triage: triageVal, is_urgent: isUrgentVal, urgency_score: urgencyScoreVal });
      addToast('success', "Analyse complète et prédictions générées");
      if (triageVal === 1) addAlert('CRITIQUE', "Patient critique détecté - Action immédiate requise");
      if (losVal > 14) addAlert('ATTENTION', `Durée de séjour élevée prévue (${losVal.toFixed(1)} j)`);
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === 'AbortError') {
        setErrorMsg(t.error_timeout ?? 'Request timed out');
      } else {
        console.error(err);
        setErrorMsg("Erreur lors de l'appel au modèle ML. Vérifiez que ngrok est actif.");
        addToast('error', "API indisponible - Échec de l'analyse");
      }
    } finally {
      setIsPredicting(false);
    }
  }

  return {
    predictions,
    setPredictions,
    isPredicting,
    setIsPredicting,
    readmitResult,
    setReadmitResult,
    isPredictingReadmit,
    setIsPredictingReadmit,
    getSeason,
    handlePredict,
  };
}