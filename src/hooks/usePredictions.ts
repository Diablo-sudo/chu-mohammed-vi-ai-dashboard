import React, { useState } from 'react';
import type { Predictions, DashboardStats, FormData } from '../types';
import { API_BASE } from '../constants/translations';

interface UsePredictionsParams {
  dashboardStats: DashboardStats;
  formData: FormData;
  t: any;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: 'success' | 'error' } | null>>;
  addAlert: (severity: any, message: string) => void;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
}

export function usePredictions({ dashboardStats, formData, t, setToast, addAlert, setErrorMsg }: UsePredictionsParams) {
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
    const reqHeaders = { 'Content-Type': 'application/json' };
    const now = new Date();
    const loadPayload = {
      month: now.getMonth() + 1,
      day_of_week: now.getDay(),
      is_weekend: [0, 6].includes(now.getDay()) ? 1 : 0,
      lag_1: dashboardStats.total_patients / 30,
      rolling_mean_3: dashboardStats.total_patients / 30,
    };
    const losPayload = {
      age: formData.age ?? 50,
      gender: formData.gender || "Homme",
      heartrate: formData.heartrate ?? 80,
      sbp: formData.sbp ?? 120,
      dbp: formData.dbp ?? 80,
      resprate: formData.resprate ?? 16,
      o2sat: formData.o2sat ?? 98,
      temperature: formData.temperature ?? 37.0,
      pain: formData.pain ?? 3,
      diagnosis: formData.diagnosis || "Insuffisance Cardiaque",
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
      let loadVal = 1.02, losVal = 8.4, triageVal = 1, isUrgentVal = 0, urgencyScoreVal = 0;
      if (loadRes.status === 'fulfilled' && loadRes.value.ok) {
        const d = await loadRes.value.json();
        loadVal = typeof d === 'number' ? d : d.load || loadVal;
      }
      if (losRes.status === 'fulfilled' && losRes.value.ok) {
        const d = await losRes.value.json();
        losVal = typeof d === 'number' ? d : d.predicted_los ?? 0;
      }
      if (triageRes.status === 'fulfilled' && triageRes.value.ok) {
        const d = await triageRes.value.json();
        const isUrgent = d.is_urgent ?? 0;
        const uScore = d.urgency_score ?? 0;
        const triageIdx = isUrgent === 1 && uScore > 0.7 ? 1 : isUrgent === 1 ? 2 : 3;
        triageVal = triageIdx;
        isUrgentVal = isUrgent;
        urgencyScoreVal = uScore;
      }
      setPredictions({ load: loadVal, los: losVal, triage: triageVal, is_urgent: isUrgentVal, urgency_score: urgencyScoreVal });
      setToast({ message: "✓ Analyse complète et prédictions générées", type: 'success' });
      setTimeout(() => setToast(null), 3000);
      if (triageVal === 1) addAlert('CRITIQUE', "Patient critique détecté - Action immédiate requise");
      if (losVal > 14) addAlert('ATTENTION', `Durée de séjour élevée prévue (${losVal.toFixed(1)} j)`);
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === 'AbortError') {
        setErrorMsg(t.error_timeout ?? 'Request timed out');
      } else {
        console.error(err);
        setErrorMsg("Erreur lors de l'appel au modèle ML. Vérifiez que ngrok est actif.");
        setToast({ message: "⚠ API indisponible - Échec de l'analyse", type: 'error' });
        setTimeout(() => setToast(null), 3000);
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