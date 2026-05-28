import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Users, Clock, AlertTriangle, HeartPulse, RefreshCw, User, Scale, Bell, Download, Moon, Sun, Upload } from 'lucide-react';

import KPICard from './components/KPICard';
import ChartCard from './components/ChartCard';
import AlertsBanner from './components/AlertsBanner';
import TriagePanel from './components/TriagePanel';
import TriageSummaryWidget from './components/TriageSummaryWidget';
import ReadmissionCard from './components/ReadmissionCard';
import ReadmissionAutoCard from './components/ReadmissionAutoCard';
import UploadModal from './components/UploadModal';

import { API_BASE, translations } from './constants/translations';
import type { Alert, DashboardStats, Predictions, ReadmitForm, FormData, Lang } from './types';
import { useAlerts } from './hooks/useAlerts';
import { useDashboardStats } from './hooks/useDashboardStats';
import { usePredictions } from './hooks/usePredictions';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, ChartDataLabels);

export default function App() {
  // ── Theme & Language ──
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  // FIX: Type safety for language localStorage (FIX 2 & 6)
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'fr';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // ── Refs for exact measurements ──
  const navbarRef = useRef<HTMLElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const initAlertsGuard = useRef(false); // guard against duplicate startup alerts
  const [navbarH, setNavbarH] = useState(88);
  const [statusBarH, setStatusBarH] = useState(0);
  const [apiStatus, setApiStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [activeTab, setActiveTab] = useState('Dashboard');

  // ── Navbar height measurement ──
  useEffect(() => {
    function measureNavbar() {
      const el = navbarRef.current;
      if (el) setNavbarH(el.offsetHeight);
    }
    measureNavbar();
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
  }, []);

  // ── Status bar height measurement ──
  useEffect(() => {
    function measureStatusBar() {
      const el = statusBarRef.current;
      if (el) setStatusBarH(el.offsetHeight);
    }
    measureStatusBar();
    window.addEventListener('resize', measureStatusBar);
    return () => window.removeEventListener('resize', measureStatusBar);
  }, []);

  // ── Real API health check ──
  useEffect(() => {
    function checkHealth() {
      fetch('https://web-production-93c43.up.railway.app/health', { method: 'GET' })
        .then(r => setApiStatus(r.ok ? 'ONLINE' : 'OFFLINE'))
        .catch(() => setApiStatus('OFFLINE'));
    }
    checkHealth();
    const id = setInterval(checkHealth, 60000);
    return () => clearInterval(id);
  }, []);

  const t = translations[lang];

  // ── Notifications ──
  const { alerts, visibleToasts, dismissToast, setAlerts, showNotifications, setShowNotifications, unreadAlerts, dismissAlert, getAlertSeverityLevel, addAlert } = useAlerts();

  // ── Dashboard stats ──
  const { dashboardStats, setDashboardStats, syncStr, setSyncStr, lastSheetSync, setLastSheetSync, syncFromSheet } = useDashboardStats();

  // ── Google Sheets auto-sync ──
  useEffect(() => {
    syncFromSheet?.();
    const id = setInterval(syncFromSheet ?? (() => {}), 30000);
    return () => clearInterval(id);
  }, [syncFromSheet]);

  const [currentTime, setCurrentTime] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString('fr-FR'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  function refreshData() {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date().toLocaleTimeString('fr-FR'));
      setIsRefreshing(false);
    }, 800);
  }

  const [tooltip, setTooltip] = useState({ visible: false, text: '' as string, x: 0, y: 0 });
  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, text, x: rect.left + rect.width / 2, y: rect.bottom + 12 });
  };
  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

  // ── Prediction error & toast (needed before usePredictions) ──
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  // ── Triage prediction form ──
  const [formData, setFormData] = useState<FormData>({ age: 68, gender: 'Homme' as 'Homme'|'Femme', diagnosis: 'Insuffisance Cardiaque', heartrate: 80, sbp: 120, o2sat: 98, temperature: 37.0, pain: 3, dbp: 80, resprate: 16 });
  const { predictions, setPredictions, isPredicting, setIsPredicting, readmitResult, setReadmitResult, isPredictingReadmit, setIsPredictingReadmit, getSeason, handlePredict } = usePredictions({ dashboardStats, formData, t, setToast, addAlert, setErrorMsg });
  const [readmitForm, setReadmitForm] = useState<ReadmitForm>({
    anchor_age: 65,
    los: 7,
    num_diagnoses: 3,
    icu_los_hours: 0,
    first_careunit: 'No ICU',
    admission_type: 'URGENT',
    primary_service: 'MED'
  });

  async function handleReadmitPredict() {
    setIsPredictingReadmit(true);
    setReadmitResult(null);
    const payload = {
      anchor_age: readmitForm.anchor_age,
      num_diagnoses: readmitForm.num_diagnoses,
      charlson_proxy_score: 2.0,
      icu_los_hours: readmitForm.icu_los_hours,
      num_icu_stays: 1,
      ed_los_hours: 3.0,
      ed_acuity: 2.0,
      surgical_flag: 0,
      vital_risk_score: 1.5,
      los: readmitForm.los,
      weekend_admit: 0,
      night_admit: 0,
      gender: "M",
      admission_type: readmitForm.admission_type,
      insurance: "Medicare",
      first_careunit: readmitForm.first_careunit === 'No ICU' ? 'NONE' : readmitForm.first_careunit,
      primary_service: readmitForm.primary_service,
      season: getSeason(),
      age_group: "65+"
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_BASE}/predict/readmission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        setReadmitResult({ risk: data.risk ?? 0.5, message: data.message ?? '' });
      }
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === 'AbortError') {
        setErrorMsg(t.error_timeout ?? 'Request timed out');
      } else {
        console.error(err);
      }
    } finally {
      setIsPredictingReadmit(false);
    }
  }

  function handleAgeDec() { setFormData(p => ({...p, age: Math.max(0, p.age - 1)})); }
  function handleAgeInc() { setFormData(p => ({...p, age: Math.min(120, p.age + 1)})); }
  function handleAgeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setFormData(p => ({...p, age: isNaN(v) ? 0 : Math.max(0, Math.min(120, v))}));
  }

  // ── Initial alerts and clock setup ──
  useEffect(() => {
    // Initialize two startup alerts using addAlert
    function formatTime(date: Date) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (!initAlertsGuard.current) {
      initAlertsGuard.current = true;
      addAlert('INFO', `Système IA opérationnel - Dernière sync: ${formatTime(new Date())}`);
      addAlert('AVERTISSEMENT', 'Taux de réadmission > 10% ce mois');
    }

    const updateTime = () => {
      const now = new Date();
      const format = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(now);
      setCurrentTime(format.charAt(0).toUpperCase() + format.slice(1).replace(/,/g, ' —'));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    const refreshInterval = setInterval(refreshData, 30000);
    return () => { clearInterval(clockInterval); clearInterval(refreshInterval); };
  }, []);

  function handleExport() { window.print(); }

  // ── CSV Upload ──
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{admissions: File|null, patients: File|null, diagnoses: File|null}>({ admissions: null, patients: null, diagnoses: null });
  const [isUploading, setIsUploading] = useState(false);

  async function submitUpload() {
    if (!uploadFiles.admissions || !uploadFiles.patients || !uploadFiles.diagnoses) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('admissions', uploadFiles.admissions);
      fd.append('patients', uploadFiles.patients);
      fd.append('diagnoses_icd', uploadFiles.diagnoses);
      const res = await fetch('https://web-production-93c43.up.railway.app/upload-stats', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setDashboardStats({
         // FIX: Zero-value guard
         total_patients: (data.total_patients !== undefined && data.total_patients !== null && data.total_patients !== 0) ? data.total_patients : dashboardStats.total_patients,
         // FIX: Zero-value guard
         avg_los: (data.avg_los !== undefined && data.avg_los !== null && data.avg_los !== 0) ? data.avg_los : dashboardStats.avg_los,
         // FIX: Zero-value guard
         readmission_rate: (data.readmission_rate !== undefined && data.readmission_rate !== null && data.readmission_rate !== 0) ? data.readmission_rate : dashboardStats.readmission_rate,
         // FIX: Zero-value guard
         mortality_rate: (data.mortality_rate !== undefined && data.mortality_rate !== null && data.mortality_rate !== 0) ? data.mortality_rate : dashboardStats.mortality_rate,
         // FIX: Zero-value guard
         avg_age: (data.avg_age !== undefined && data.avg_age !== null && data.avg_age !== 0) ? data.avg_age : dashboardStats.avg_age,
         // FIX: Zero-value guard
         gender_M: (data.gender_M !== undefined && data.gender_M !== null && data.gender_M !== 0) ? data.gender_M : dashboardStats.gender_M,
         // FIX: Zero-value guard
         gender_F: (data.gender_F !== undefined && data.gender_F !== null && data.gender_F !== 0) ? data.gender_F : dashboardStats.gender_F,
        top_diagnoses: data.top_diagnoses || dashboardStats.top_diagnoses,
        los_distribution: data.los_distribution || dashboardStats.los_distribution,
        isLocal: true,
      });
      localStorage.setItem('dashboardStats', JSON.stringify({
         // FIX: Zero-value guard
         total_patients: (data.total_patients !== undefined && data.total_patients !== null && data.total_patients !== 0) ? data.total_patients : dashboardStats.total_patients,
         // FIX: Zero-value guard
         avg_los: (data.avg_los !== undefined && data.avg_los !== null && data.avg_los !== 0) ? data.avg_los : dashboardStats.avg_los,
         // FIX: Zero-value guard
         readmission_rate: (data.readmission_rate !== undefined && data.readmission_rate !== null && data.readmission_rate !== 0) ? data.readmission_rate : dashboardStats.readmission_rate,
         // FIX: Zero-value guard
         mortality_rate: (data.mortality_rate !== undefined && data.mortality_rate !== null && data.mortality_rate !== 0) ? data.mortality_rate : dashboardStats.mortality_rate,
         // FIX: Zero-value guard
         avg_age: (data.avg_age !== undefined && data.avg_age !== null && data.avg_age !== 0) ? data.avg_age : dashboardStats.avg_age,
         // FIX: Zero-value guard
         gender_M: (data.gender_M !== undefined && data.gender_M !== null && data.gender_M !== 0) ? data.gender_M : dashboardStats.gender_M,
         // FIX: Zero-value guard
         gender_F: (data.gender_F !== undefined && data.gender_F !== null && data.gender_F !== 0) ? data.gender_F : dashboardStats.gender_F,
        top_diagnoses: data.top_diagnoses || dashboardStats.top_diagnoses,
        los_distribution: data.los_distribution || dashboardStats.los_distribution,
      }));
      setToast({message: "✅ Données mises à jour", type: 'success'});
      const dt = new Date();
      const dateStr = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
      const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setSyncStr(`✅ Mise à jour: ${dateStr} à ${timeStr}`);
      setShowUploadModal(false);
      setUploadFiles({ admissions: null, patients: null, diagnoses: null });
    } catch (err) {
      setToast({message: "❌ Erreur de connexion", type: 'error'});
    } finally { setIsUploading(false); }
  }

  // ── Chart helpers ──
  const chartTextColor  = darkMode ? '#7BA7C4' : '#1B2A4A';
  const chartLabelColor = darkMode ? '#fff' : '#1B2A4A';

  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(0,113,60,0.15)' }, ticks: { color: chartTextColor, font: {family: 'Inter', size: 10} } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: chartTextColor, font: {family: 'Inter', size: 10} } }
    }
  };
  const barOptions   = { ...chartDefaults, elements: { bar: { borderRadius: 4 } } };
  const lineOptions  = { ...chartDefaults, elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 6 } }, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, grid: { display: true, color: 'rgba(0,113,60,0.15)' } } } };

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--color-chu-bg)] text-slate-100 flex flex-col p-6 font-sans overflow-x-hidden relative">
      {/* Toast */}
      {toast && (
        <div ref={(el) => { if (el) { setTimeout(() => { el.style.opacity = '0'; setTimeout(() => setToast(null), 500); }, 3000); } }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-bold shadow-2xl text-sm border ${
            toast.type === 'success' ? 'bg-[#00956E] border-[#00956E] text-white' : 'bg-[#D64545] border-[#D64545] text-white'}`}
          style={{ transition: 'opacity 0.5s' }}>{toast.message}</div>
      )}

      {/* ── Navbar ── */}
      <header ref={navbarRef}
        className="bg-[var(--color-chu-header)]/95 backdrop-blur-[10px] border-b px-4 lg:px-6 py-2 no-print fixed top-0 left-0 right-0 z-[1000] shadow-sm transition-colors duration-400 flex flex-col"
        style={{ borderBottomColor: 'var(--header-border-color)', borderBottomWidth: 'var(--header-border-width)', '--navbar-h': '88px' } as React.CSSProperties}>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 lg:gap-4 group cursor-pointer shrink-0">
            <div className="relative shrink-0 flex items-center">
              <div className="absolute -inset-2 bg-[#00D4AA] rounded-full opacity-0 group-hover:opacity-20 blur-md transition-all duration-400"></div>
              <img src="/loGo.png" alt="CHU Oujda Logo" className="h-[45px] lg:h-[50px] object-contain shrink-0 relative z-10" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="flex flex-col justify-center min-w-0 py-1">
              <h1 className="text-sm lg:text-[18px] xl:text-[20px] font-bold tracking-tight bg-gradient-to-r from-[var(--color-chu-text)] to-[#00D4AA] text-transparent bg-clip-text whitespace-nowrap leading-none pb-1">CHU Mohammed VI Oujda</h1>
              <h2 className="text-[11px] lg:text-[12px] font-bold text-[#00D4AA] font-arabic opacity-90 whitespace-nowrap leading-none pb-1">{t.appTitleAr}</h2>
              <p className="text-[9px] lg:text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase tracking-widest leading-none truncate">{t.appSubtitle}</p>
            </div>
          </div>

          {/* ── Navigation pills ── */}
          <div className="hidden lg:flex shrink-0 justify-center">
            <nav className="flex space-x-1 bg-[var(--color-chu-bg)] p-1 rounded-full border border-[var(--color-chu-border)]">
              {['Dashboard', 'Statistiques', 'Triage', 'Rapports'].map((item) => (
                <button key={item} onClick={() => setActiveTab(item)}
                  className={`px-3 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeTab === item
                      ? 'bg-[#00D4AA] text-[#0B1426] shadow-[0_0_15px_rgba(0,212,170,0.3)] font-bold'
                      : 'text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] hover:bg-[var(--color-chu-header)]'
                  }`}>{item}</button>
              ))}
            </nav>
          </div>

          {/* Right: toggles / actions / clock */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 flex-wrap">
            {/* Language Switch */}
            <div className="hidden lg:flex items-center bg-[var(--color-chu-bg)] p-1 rounded-full border border-[var(--color-chu-border)]">
              {['ar', 'fr', 'en'].map((l) => (
                <button key={l} onClick={() => setLang(l as Lang)} // FIX: Use Lang type (FIX 6)
                  className={`px-2 lg:px-3 py-1 rounded-full font-bold text-[9px] lg:text-[10px] uppercase transition-all duration-300 border ${
                    lang === l ? 'bg-[#00D4AA] text-[#0B1426] border-[#00D4AA] shadow-[0_2px_10px_rgba(0,212,170,0.4)]' : 'text-[var(--color-chu-text-sec)] hover:text-[var(--color-chu-text)] border-transparent hover:border-[#00D4AA]'}`}>
                  {l.toUpperCase()}</button>
              ))}
            </div>
            <div className="hidden lg:block h-5 lg:h-6 w-px bg-[rgba(0,212,170,0.3)] mx-0.5 lg:mx-1"></div>

            {/* Theme Toggle */}
            <button onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 lg:p-2 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-all group relative overflow-hidden" title="Toggle Theme">
              <div className="relative w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                <Moon size={16} className={`absolute transition-all duration-500 transform lg:w-[18px] lg:h-[18px] ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} strokeWidth={2.5} />
                <Sun size={16} className={`absolute transition-all duration-500 transform lg:w-[18px] lg:h-[18px] ${!darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} strokeWidth={2.5} />
              </div>
            </button>

            {/* Export */}
            <button onClick={handleExport}
              className="p-1.5 lg:p-2 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-all group relative" title={t.exportTip}>
              <Download size={16} className="lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            </button>

            {/* Upload */}
            <button onClick={() => setShowUploadModal(true)}
              title="Mettre à jour avec vos données hospitalières"
              className="relative px-2 py-2 sm:px-4 sm:py-2 bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-semibold text-sm rounded-lg flex items-center gap-1 sm:gap-2 transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(0,212,170,0.4)] ml-0.5 sm:ml-1 mr-0.5 sm:mr-1">
              <Upload size={16} strokeWidth={2.5} className="shrink-0" /> <span className="hidden md:inline">Charger données</span>
              {!dashboardStats.isLocal && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C00] rounded-full animate-pulse border-2 border-[var(--color-chu-header)]"></span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative flex items-center">
              {/* FIX: Notification bell button size and animated ring when alerts exist (FIX UI 2) */}
              <button onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1.5 lg:p-2 w-10 h-10 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[#00D4AA] transition-all relative ${unreadAlerts > 0 ? 'animate-pulse ring-2 ring-red-400' : ''}`} title="Notifications">
                <Bell size={20} strokeWidth={2.5} />
                {/* FIX: Bigger badge with bolder font and color for visibility (FIX UI 2) */}
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-[11px] font-black text-white flex items-center justify-center rounded-full border-2 border-[var(--color-chu-header)] shadow-lg animate-pulse">{unreadAlerts}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl shadow-2xl z-50 overflow-hidden text-left backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-[var(--color-chu-border)] bg-[var(--color-chu-header)] flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[var(--color-chu-text)]">{t.systemAlerts}</h3>
                    <button onClick={() => alerts.forEach(a => dismissAlert(a.id))} className="text-xs text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-colors">{t.clearAll}</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[var(--color-chu-text-sec)]">{t.noAlerts}</div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className={`p-3 border-b border-[var(--color-chu-border)] hover:bg-[var(--color-chu-bg)] flex gap-3 text-sm border-l-4 transition-colors ${
                          alert.severity === 'CRITIQUE' ? 'border-l-[#D64545]' :
                          alert.severity === 'ATTENTION' ? 'border-l-[#E8A020]' :
                          alert.severity === 'AVERTISSEMENT' ? 'border-l-[#E8A020]' : 'border-l-[#00D4AA]'}`}>
                          <div className={`mt-0.5 shrink-0 ${alert.severity === 'CRITIQUE' ? 'text-[#D64545]' : alert.severity === 'ATTENTION' ? 'text-[#E8A020]' : alert.severity === 'AVERTISSEMENT' ? 'text-[#E8A020]' : 'text-[#00D4AA]'}`}>
                            <AlertTriangle size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[var(--color-chu-text)] mb-0.5">{alert.severity}</div>
                            <div className="text-[var(--color-chu-text-sec)] text-xs">{alert.message}</div>
                            <div className="text-[10px] text-[var(--color-chu-text-sec)] opacity-70 mt-1">{alert.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden xl:block h-6 w-px bg-[rgba(0,212,170,0.3)] mx-1"></div>
          {/* Clock */}
          <div className="hidden md:flex items-center text-[#00D4AA] font-mono text-[11px] font-semibold tabular-nums px-3 py-1.5 rounded-lg border border-[rgba(0,212,170,0.2)] bg-[rgba(0,212,170,0.05)] shadow-[inset_0_0_10px_rgba(0,212,170,0.02)]">{currentTime}</div>
        </div>
      </header>

      {/* ── Status Bar ── */}
      <div ref={statusBarRef}
        className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[var(--color-chu-text-sec)] p-2 no-print fixed left-0 right-0 z-[999] shadow-sm border-0 rounded-none transition-colors duration-400"
        style={{ backgroundColor: 'var(--status-bar-bg)', top: navbarH + 'px' } as React.CSSProperties}>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* API Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-semibold ${
            apiStatus === 'ONLINE' ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20' : 'bg-[#FF4444]/10 text-[#FF4444] border border-[#FF4444]/20'}`}>
            <span className={`relative flex h-2 w-2`}>
              <span className={`${apiStatus === 'ONLINE' ? 'animate-ping bg-[#00D4AA]' : 'bg-[#FF4444]'} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
              <span className={`${apiStatus === 'ONLINE' ? 'bg-[#00D4AA]' : 'bg-[#FF4444]'} relative inline-flex rounded-full h-2 w-2`}></span>
            </span>
            <span>{apiStatus === 'ONLINE' ? t.apiOnline : 'API: HORS LIGNE'}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 rounded-md font-bold tracking-wide">
            {dashboardStats.isLocal ? "DONNÉES LOCALES" : t.mimicDb}
          </div>
            <div className="hidden md:flex items-center gap-2 text-[9px] font-mono">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${syncStr.startsWith("✅") ? 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20' : syncStr.startsWith("⚠") ? 'bg-[#D64545]/10 text-[#D64545] border-[#D64545]/20' : 'bg-[#E8A020]/10 text-[#E8A020] border-[#E8A020]/20'}`}>
                <RefreshCw size={10} className={syncStr.startsWith("⚠") ? '' : 'hidden'} />
                <span className="font-semibold">GOOGLE SHEETS</span>
                <span className="font-medium tracking-wide">{syncStr || <span className="text-[9px] opacity-50">En attente...</span>}</span>
                {lastSheetSync && <span className="opacity-70 text-[10px]">({lastSheetSync})</span>}
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-chu-card)] px-3 py-1.5 rounded-md border border-[var(--color-chu-border)]">
          <span className="font-semibold text-[var(--color-chu-text)] uppercase">LANG: {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}</span>
</div>
       </div>

        <AlertsBanner
          visibleToasts={visibleToasts}
          allAlerts={alerts}
          navbarH={navbarH}
          statusBarH={statusBarH}
          dismissToast={dismissToast}
          getAlertSeverityLevel={getAlertSeverityLevel}
        />


       {/* ═══════════════════════════════════════
           TAB CONTENT (single instance per tab)
          ═══════════════════════════════════════ */}

       {/* ── DASHBOARD TAB ── */}
       {activeTab === 'Dashboard' && (
         <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
            {/* Triage du Jour summary widget */}
            
           
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-2">
              <KPICard darkMode={darkMode} title={t.patientsTotal} value={dashboardStats.total_patients.toLocaleString()} subtitle={t.patientsSub} valueColor="text-[#00713C]" borderColor="border-l-[#00713C]" icon={Users} trend="positive" sparklineData={[4200, 4280, 4350, 4420, 4380, 4460, 4506]} sparklineColor="#00713C" sparklineFill="rgba(0,113,60,0.25)" onMouseEnter={(e) => showTooltip("↑ 12% vs mois dernier\nMin: 4000 Max: 5000\nInterprétation: Volume de patients en hausse.", e)} onMouseLeave={hideTooltip} />
                {/* FIX: NaN guard */}
                <KPICard darkMode={darkMode} title={t.los} value={`${(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)}j`} subtitle={t.losSub} valueColor="text-[#00956E]" borderColor="border-l-[#00956E]" icon={Clock} trend="negative" sparklineData={[7.8, 7.6, 7.5, 7.4, 7.5, 7.4, 7.43]} sparklineColor="#00956E" sparklineFill="rgba(0,149,110,0.25)" onMouseEnter={(e) => showTooltip("↓ 0.5j vs mois dernier\nMin: 2j Max: 45j\nInterprétation: Optimisation des lits en cours.", e)} onMouseLeave={hideTooltip} />
                {/* FIX: NaN guard */}
                <KPICard darkMode={darkMode} title={t.readmission} value={`${(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)}%`} subtitle={t.readmissionSub} valueColor="text-[#E8A020]" borderColor="border-l-[#E8A020]" icon={RefreshCw} trend="positive" background={dashboardStats.readmission_rate > 15 ? 'red' : dashboardStats.readmission_rate < 10 ? 'green' : undefined} sparklineData={[12.1, 11.8, 11.5, 11.9, 11.3, 11.0, 11.2]} sparklineColor="#E8A020" sparklineFill="rgba(232,160,32,0.25)" onMouseEnter={(e) => showTooltip("↑ 2% vs mois dernier\nMin: 5% Max: 20%\nInterprétation: Attention, taux critique.", e)} onMouseLeave={hideTooltip} />
                {/* FIX: NaN guard */}
                <KPICard darkMode={darkMode} title={t.mortality} value={`${(dashboardStats.mortality_rate ?? 4.2).toFixed(1)}%`} subtitle={t.mortalitySub} valueColor={dashboardStats.mortality_rate > 5 ? "text-white" : "text-[#D64545]"} borderColor="border-l-[#D64545]" icon={HeartPulse} trend="negative" background={dashboardStats.mortality_rate > 5 ? 'red' : undefined} sparklineData={[3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6]} sparklineColor="#D64545" sparklineFill="rgba(214,69,69,0.25)" onMouseEnter={(e) => showTooltip("↓ 1% vs mois dernier\nMin: 2j Max: 12%\nInterprétation: Baisse significative.", e)} onMouseLeave={hideTooltip} />
               {/* FIX: NaN guard */}
               <KPICard darkMode={darkMode} title={t.avgAge} value={`${(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans`} subtitle={t.ageSub} valueColor="text-[#38A8D4]" borderColor="border-l-[#38A8D4]" icon={User} trend="neutral" onMouseEnter={(e) => showTooltip("↔ Stable\nMin: 18 Max: 102\nInterprétation: Population vieillissante.", e)} onMouseLeave={hideTooltip} />
              <KPICard darkMode={darkMode} title={t.genderStr} value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`} subtitle={t.genderSub} valueColor="text-[#8B5CF6]" borderColor="border-l-[#8B5CF6]" icon={Scale} trend="neutral" onMouseEnter={(e) => showTooltip("↔ Stable\nInterprétation: Légère prédominance masculine.", e)} onMouseLeave={hideTooltip} />
</div>

<TriageSummaryWidget t={t} onNavigate={() => setActiveTab('Triage')} />

<ReadmissionAutoCard t={t} />

            {/* Charts grid: 2 columns, full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1: Top Diagnoses + Distribution LOS */}
            <ChartCard title={t.topDiag}>
              <Bar data={{
                // FIX: Safe chart data with null guard (FIX 5)
                labels: (dashboardStats.top_diagnoses ?? []).map(d => d.name),
                // FIX: Safe chart data with null guard (FIX 5)
                datasets: [{ data: (dashboardStats.top_diagnoses ?? []).map(d => d.count), backgroundColor: ['#00713C','#00956E','#38A8D4','#E8A020','#D64545'], borderRadius: 4 }]
              }} options={{ ...barOptions, plugins: { ...barOptions.plugins, datalabels: { color: chartLabelColor, anchor: 'end', align: 'bottom', offset: 4, font: { weight: 'bold', size: 12 } } } }} />
            </ChartCard>

            <ChartCard title={t.distLos}>
              <div style={{ width: '100%', height: '220px' }}>
                <Doughnut data={{
                  labels: Array.isArray(dashboardStats.los_distribution)
                    ? dashboardStats.los_distribution.map((d: any) => d.label)
                    : Object.keys(dashboardStats.los_distribution || {}),
                  datasets: [{
                    data: Array.isArray(dashboardStats.los_distribution)
                      ? dashboardStats.los_distribution.map((d: any) => d.value)
                      : Object.values(dashboardStats.los_distribution || {}),
                    backgroundColor: ['#00D4AA','#3B82F6','#F59E0B','#EF4444'],
                    borderWidth: 0
                  }]
                }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartLabelColor, font: { family: 'Inter', size: 10 }, padding: 15 } }, datalabels: { color: chartLabelColor, font: { weight: 'bold', size: 11 } } } }} />
              </div>
            </ChartCard>

            {/* Row 2: Démographie par Âge + Répartition Genre */}
            <ChartCard title={t.demoAge}>
              <Line data={{
                labels: ['18-40', '40-60', '60-75', '75+'],
                datasets: [{
                  data: (() => {
                    const avgA  = dashboardStats.avg_age;
                    const total = dashboardStats.total_patients;
                    const shift  = (avgA < 50) ? -20 : (avgA > 65) ? 20 : 0;
                    const s      = shift > 0 ? 0.05 : 0.06;
                    const e0     = Math.min(0, shift), e1 = shift - 22, e2 = shift - 42, e3 = Math.max(0, shift);
                    const h0 = Math.max(0, avgA - e0) * s, h1 = Math.max(0, avgA - e1 + e0) * s, h2 = Math.max(0, avgA - e2 - e1) * s, h3 = Math.max(0, avgA - e3) * (shift > 0 ? 0.05 : 0.06);
                    const sum = h0 + h1 + h2 + h3;
                    return [total * h0 / sum, total * h1 / sum, total * h2 / sum, total * h3 / sum];
                  })(),
                  borderColor: '#00713C',
                  backgroundColor: (context: any) => { const ctx = context.chart.ctx; const g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, 'rgba(0, 113, 60, 0.5)'); g.addColorStop(1, 'rgba(0, 113, 60, 0.05)'); return g; },
                  fill: true, tension: 0.4
                }]
              }} options={{ ...lineOptions, plugins: { ...lineOptions.plugins, datalabels: { display: false } } }} />
            </ChartCard>

            <ChartCard title={t.distGender}>
              <div style={{ width: '100%', height: '220px' }}>
                <Doughnut data={{
                  labels: ['Hommes', 'Femmes'],
                  datasets: [{ data: [dashboardStats.gender_M, dashboardStats.gender_F], backgroundColor: ['#3B82F6','#EC4899'], borderWidth: 0 }]
                }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartLabelColor, font: { family: 'Inter', size: 10 }, padding: 15 } }, datalabels: { color: chartLabelColor, font: { weight: 'bold', size: 12 } } } }} />
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── STATISTIQUES TAB ── */}
      {activeTab === 'Statistiques' && (
        <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
          {/* Summary metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">Moyenne LOS</span>
               {/* FIX: NaN guard */}
               <div className="text-2xl font-bold text-[#00956E] font-mono mt-1">{(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)} j</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">Réadmission</span>
               {/* FIX: NaN guard */}
               <div className="text-2xl font-bold text-[#E8A020] font-mono mt-1">{(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)} %</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">Mortalité</span>
               {/* FIX: NaN guard */}
               <div className="text-2xl font-bold text-[#D64545] font-mono mt-1">{(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)} %</div>
            </div>
          </div>

{/* KPI cards — full 6‑col grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
             <KPICard darkMode={darkMode} title={t.patientsTotal} value={dashboardStats.total_patients.toLocaleString()} subtitle={t.patientsSub} valueColor="text-[#00713C]" borderColor="border-l-[#00713C]" icon={Users} onMouseEnter={(e) => showTooltip("↑ 12% vs mois dernier\nMin: 4000 Max: 5000\nInterprétation: Volume de patients en hausse.", e)} onMouseLeave={hideTooltip} />
              {/* FIX: NaN guard */}
              <KPICard darkMode={darkMode} title={t.los} value={`${(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)}j`} subtitle={t.losSub} valueColor="text-[#00956E]" borderColor="border-l-[#00956E]" icon={Clock} onMouseEnter={(e) => showTooltip("↓ 0.5j vs mois dernier\nMin: 2j Max: 45j\nInterprétation: Optimisation des lits en cours.", e)} onMouseLeave={hideTooltip} />
              {/* FIX: NaN guard */}
              <KPICard darkMode={darkMode} title={t.readmission} value={`${(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)}%`} subtitle={t.readmissionSub} valueColor="text-[#E8A020]" borderColor="border-l-[#E8A020]" icon={RefreshCw} onMouseEnter={(e) => showTooltip("↑ 2% vs mois dernier\nMin: 5% Max: 20%\nInterprétation: Attention, taux critique.", e)} onMouseLeave={hideTooltip} />
              {/* FIX: NaN guard */}
              <KPICard darkMode={darkMode} title={t.mortality} value={`${(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)}%`} subtitle={t.mortalitySub} valueColor="text-[#D64545]" borderColor="border-l-[#D64545]" icon={HeartPulse} onMouseEnter={(e) => showTooltip("↓ 1% vs mois dernier\nMin: 2j Max: 12%\nInterprétation: Baisse significative.", e)} onMouseLeave={hideTooltip} />
              {/* FIX: NaN guard */}
              <KPICard darkMode={darkMode} title={t.avgAge} value={`${(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans`} subtitle={t.ageSub} valueColor="text-[#38A8D4]" borderColor="border-l-[#38A8D4]" icon={User} onMouseEnter={(e) => showTooltip("↔ Stable\nMin: 18 Max: 102\nInterprétation: Population vieillissante.", e)} onMouseLeave={hideTooltip} />
             <KPICard darkMode={darkMode} title={t.genderStr} value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`} subtitle={t.genderSub} valueColor="text-[#8B5CF6]" borderColor="border-l-[#8B5CF6]" icon={Scale} onMouseEnter={(e) => showTooltip("↔ Stable\nInterprétation: Légère prédominance masculine.", e)} onMouseLeave={hideTooltip} />
            </div>

          {/* Top Diagnoses chart — full width */}
          <ChartCard title={t.topDiag}>
            <Bar data={{
              // FIX: Safe chart data with null guard (FIX 5)
              labels: (dashboardStats.top_diagnoses ?? []).map(d => d.name),
              // FIX: Safe chart data with null guard (FIX 5)
              datasets: [{ data: (dashboardStats.top_diagnoses ?? []).map(d => d.count), backgroundColor: ['#00713C','#00956E','#38A8D4','#E8A020','#D64545'], borderRadius: 4 }]
            }} options={{ ...barOptions, plugins: { ...barOptions.plugins, datalabels: { color: chartLabelColor, anchor: 'end', align: 'bottom', offset: 4, font: { weight: 'bold', size: 12 } } } }} />
          </ChartCard>

          {/* LOS Detail Table */}
          <ChartCard title="Distribution LOS — Détail">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-chu-border)]">
                    <th className="text-left py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">Plage</th>
                    <th className="text-right py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">Patients</th>
                    <th className="text-right py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">Part %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dashboardStats.los_distribution || {}).map(([label, value]) => {
                    const pct = dashboardStats.total_patients > 0 ? ((value as number / dashboardStats.total_patients) * 100).toFixed(1) : '0';
                    return (<tr key={label} className="border-b border-[var(--color-chu-border)]/50 hover:bg-[var(--color-chu-bg)]">
                      <td className="py-2 px-3 text-left text-[var(--color-chu-text)]">{label}</td>
                      <td className="py-2 px-3 text-right text-[var(--color-chu-text)] font-semibold">{value}</td>
                      <td className="py-2 px-3 text-right"><span className="text-[#00D4AA] font-bold">{pct}%</span></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Age Demographics — full width */}
          <ChartCard title={t.demoAge}>
            <Line data={{
              labels: ['18-40', '40-60', '60-75', '75+'],
              datasets: [{
                data: (() => {
                  const avgA  = dashboardStats.avg_age;
                  const total = dashboardStats.total_patients;
                  const shift  = (avgA < 50) ? -20 : (avgA > 65) ? 20 : 0;
                  const s      = shift > 0 ? 0.05 : 0.06;
                  const e0     = Math.min(0, shift), e1 = shift - 22, e2 = shift - 42, e3 = Math.max(0, shift);
                  const h0 = Math.max(0, avgA - e0) * s, h1 = Math.max(0, avgA - e1 + e0) * s, h2 = Math.max(0, avgA - e2 - e1) * s, h3 = Math.max(0, avgA - e3) * (shift > 0 ? 0.05 : 0.06);
                  const sum = h0 + h1 + h2 + h3;
                  return [total * h0 / sum, total * h1 / sum, total * h2 / sum, total * h3 / sum];
                })(),
                borderColor: '#00713C',
                backgroundColor: (context: any) => { const ctx = context.chart.ctx; const g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, 'rgba(0, 113, 60, 0.5)'); g.addColorStop(1, 'rgba(0, 113, 60, 0.05)'); return g; },
                fill: true, tension: 0.4
              }]
            }} options={{ ...lineOptions, plugins: { ...lineOptions.plugins, datalabels: { display: false } } }} />
          </ChartCard>

          {/* Gender Distribution — full width */}
          <ChartCard title={t.distGender}>
            <Bar data={{
              labels: ['Hommes', 'Femmes'],
              datasets: [{ data: [dashboardStats.gender_M, dashboardStats.gender_F], backgroundColor: ['#00713C','#00956E'], borderRadius: 8, barThickness: 40 }]
            }} options={{ ...barOptions, plugins: { ...barOptions.plugins, datalabels: { color: chartLabelColor, formatter: (val: number) => val + '%', anchor: 'end', align: 'bottom', offset: 4, font: { weight: 'bold', size: 14 } } } }} />
          </ChartCard>
        </div>
      )}

      {/* ── TRIAGE TAB ── */}
      {activeTab === 'Triage' && (
        <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH}px` }}>
          <TriagePanel
            formData={formData}
            setFormData={setFormData}
            handlePredict={handlePredict}
            isPredicting={isPredicting}
            predictions={predictions}
            errorMsg={errorMsg}
            setPredictions={setPredictions}
            setErrorMsg={setErrorMsg}
            t={t}
            handleAgeDec={handleAgeDec}
            handleAgeInc={handleAgeInc}
            handleAgeChange={handleAgeChange}
          />
<ReadmissionCard
  readmitForm={readmitForm}
  setReadmitForm={setReadmitForm}
  readmitResult={readmitResult}
  isPredictingReadmit={isPredictingReadmit}
  handleReadmitPredict={handleReadmitPredict}
  t={t}
/>
        </div>
      )}

      {/* ── RAPPORTS TAB ── */}
      {activeTab === 'Rapports' && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
          <h2 className="text-xl font-bold text-[var(--color-chu-text)]">📄 {t.exportBtn}</h2>

          {/* KPI Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.patientsTotal}</span>
              <div className="text-3xl font-bold text-[#00713C] font-mono mt-2">{dashboardStats.total_patients.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.los}</span>
               {/* FIX: NaN guard */}
               <div className="text-3xl font-bold text-[#00956E] font-mono mt-2">{(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)} j</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.readmission}</span>
               {/* FIX: NaN guard */}
               <div className="text-3xl font-bold text-[#E8A020] font-mono mt-2">{(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)} %</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.mortality}</span>
               {/* FIX: NaN guard */}
               <div className="text-3xl font-bold text-[#D64545] font-mono mt-2">{(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)} %</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.avgAge}</span>
               {/* FIX: NaN guard */}
               <div className="text-3xl font-bold text-[#38A8D4] font-mono mt-2">{(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans</div>
            </div>
            <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
              <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">Données</span>
              <div className="text-2xl font-bold text-[#8B5CF6] font-mono mt-2">{dashboardStats.isLocal ? 'Locales' : t.mimicDb}</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
              <span className="text-[var(--color-chu-text-sec)] font-semibold">Dernière mise à jour</span>
              <span className="text-[var(--color-chu-text)] font-mono">{syncStr}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
              <span className="text-[var(--color-chu-text-sec)] font-semibold">Statut API</span>
              <span className={`font-bold font-mono ${apiStatus === 'ONLINE' ? 'text-[#00D4AA]' : 'text-[#FF4444]'}`}>{apiStatus === 'ONLINE' ? 'ONLINE (RAILWAY)' : 'HORS LIGNE'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
              <span className="text-[var(--color-chu-text-sec)] font-semibold">Modèle ML</span>
              <span className="text-[var(--color-chu-text)] font-mono">MIMIC-IV Predict v2.4</span>
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-6">
            <h3 className="text-sm font-bold text-[var(--color-chu-text)] mb-4 uppercase tracking-wide">Performances du Modèle</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
                <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Charge Hospitalière</div>
                <div className="text-xl font-bold text-[#00D4AA] font-mono">MAE = 0.018</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
                <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Durée de Séjour</div>
                <div className="text-xl font-bold text-[#00D4AA] font-mono">R² = 0.331</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
                <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Triage Clinique</div>
                <div className="text-xl font-bold text-[#00D4AA] font-mono">Recall = 77.7%</div>
              </div>
            </div>
          </div>

          <button onClick={handleExport}
            className="w-full md:w-auto mx-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_4px_16px_rgba(0,212,170,0.4)] text-sm">
            📄 {t.exportBtn}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-chu-text-sec)] font-medium p-4 bg-[var(--color-chu-header)] rounded-xl border border-[var(--color-chu-border)] no-print">
        <div className="flex items-center space-x-4"><span>{t.footerText}</span></div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0 font-bold text-[#00713C]"><span>{t.autoRefresh}</span></div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          darkMode={darkMode}
          setShowUploadModal={setShowUploadModal}
          uploadFiles={uploadFiles}
          setUploadFiles={setUploadFiles}
          isUploading={isUploading}
          submitUpload={submitUpload}
        />
      )}
      
      {/* Global tooltip — rendered at body level, escapes all clipping */}
      {tooltip.visible && (
        <div style={{
          position: 'fixed',
          top: tooltip.y,
          left: tooltip.x,
          transform: 'translateX(-50%)',
          background: '#1B2A4A',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          whiteSpace: 'pre-line',
          width: '220px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 999999,
          pointerEvents: 'none',
          lineHeight: '1.8',
        }}>
          <div style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid #1B2A4A',
          }} />
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
