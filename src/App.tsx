import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Users, Clock, AlertTriangle, HeartPulse, RefreshCw, User, Scale, Bell, Download, Moon, Sun, Upload } from 'lucide-react';

import ToastContainer from './components/ToastContainer';
import UploadModal from './components/UploadModal';
import DashboardTab from './components/DashboardTab';
import StatsTab from './components/StatsTab';
import TriageTab from './components/TriageTab';
import RapportsTab from './components/RapportsTab';

import { API_BASE, translations } from './constants/translations';
import type { Alert, DashboardStats, Predictions, ReadmitForm, FormData, Lang } from './types';
import { useAlerts } from './hooks/useAlerts';
import { useToast } from './hooks/useToast';
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
  const [apiStatus, setApiStatus] = useState<'ONLINE' | 'OFFLINE' | 'CHECKING'>('CHECKING');
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
  const { alerts, setAlerts, showNotifications, setShowNotifications, unreadAlerts, dismissAlert, getAlertSeverityLevel, addAlert } = useAlerts();
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications, setShowNotifications]);

  // ── Dashboard stats ──
  const { dashboardStats, setDashboardStats, syncStr, setSyncStr, lastSheetSync, setLastSheetSync, syncFromSheet } = useDashboardStats();

  // ── Google Sheets auto-sync ──
  const isLocalRef = useRef(dashboardStats.isLocal);
  isLocalRef.current = dashboardStats.isLocal;

  useEffect(() => {
    if (!isLocalRef.current) syncFromSheet?.();
    const id = setInterval(() => {
      if (!isLocalRef.current) syncFromSheet?.();
    }, 30000);
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

  // ── Prediction error ──
  const [errorMsg, setErrorMsg] = useState('');
  const { addToast } = useToast();

  // ── Triage prediction form ──
  const [formData, setFormData] = useState<FormData>({ age: 68, gender: 'Homme' as 'Homme'|'Femme', diagnosis: 'Insuffisance Cardiaque', heartrate: 80, sbp: 120, o2sat: 98, temperature: 37.0, pain: 3, dbp: 80, resprate: 16 });
  const { predictions, setPredictions, isPredicting, setIsPredicting, readmitResult, setReadmitResult, isPredictingReadmit, setIsPredictingReadmit, getSeason, handlePredict } = usePredictions({ dashboardStats, formData, t, addAlert, setErrorMsg });
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
    const charlsonProxy = Math.min(10, (readmitForm.anchor_age / 20) + (readmitForm.num_diagnoses / 3));
    const vitalRisk = Math.min(3, (
      (formData.heartrate > 100 ? 1 : 0) +
      (formData.sbp < 90 ? 1 : 0) +
      (formData.o2sat < 90 ? 1 : 0)
    ));
    const genderCode = formData.gender === 'Femme' ? 'F' : 'M';
    const ageGroup = readmitForm.anchor_age >= 65 ? '65+' : readmitForm.anchor_age >= 40 ? '40-64' : '18-39';
    const surgicalFlag = readmitForm.primary_service === 'SURG' ? 1 : 0;
    const payload = {
      anchor_age: readmitForm.anchor_age,
      num_diagnoses: readmitForm.num_diagnoses,
      charlson_proxy_score: charlsonProxy,
      icu_los_hours: readmitForm.icu_los_hours,
      num_icu_stays: readmitForm.icu_los_hours > 0 ? 1 : 0,
      ed_los_hours: 3.0,
      ed_acuity: vitalRisk > 1 ? 3.0 : 2.0,
      surgical_flag: surgicalFlag,
      vital_risk_score: vitalRisk,
      los: readmitForm.los,
      weekend_admit: 0,
      night_admit: 0,
      gender: genderCode,
      admission_type: readmitForm.admission_type,
      insurance: "Medicare",
      first_careunit: readmitForm.first_careunit === 'No ICU' ? 'NONE' : readmitForm.first_careunit,
      primary_service: readmitForm.primary_service,
      season: getSeason(),
      age_group: ageGroup
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
      addAlert('INFO', `${t.systemOnline} ${formatTime(new Date())}`);
      addAlert('AVERTISSEMENT', t.readmissionAlert);
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
          total_patients: (data.total_patients !== undefined && data.total_patients !== null) ? data.total_patients : dashboardStats.total_patients,
          avg_los: (data.avg_los !== undefined && data.avg_los !== null) ? data.avg_los : dashboardStats.avg_los,
          readmission_rate: (data.readmission_rate !== undefined && data.readmission_rate !== null) ? data.readmission_rate : dashboardStats.readmission_rate,
          mortality_rate: (data.mortality_rate !== undefined && data.mortality_rate !== null) ? data.mortality_rate : dashboardStats.mortality_rate,
          avg_age: (data.avg_age !== undefined && data.avg_age !== null) ? data.avg_age : dashboardStats.avg_age,
          gender_M: (data.gender_M !== undefined && data.gender_M !== null) ? data.gender_M : dashboardStats.gender_M,
          gender_F: (data.gender_F !== undefined && data.gender_F !== null) ? data.gender_F : dashboardStats.gender_F,
        top_diagnoses: data.top_diagnoses || dashboardStats.top_diagnoses,
        los_distribution: data.los_distribution || dashboardStats.los_distribution,
        isLocal: true,
      });
      localStorage.setItem('dashboardStats', JSON.stringify({
         // FIX: Zero-value guard
          total_patients: (data.total_patients !== undefined && data.total_patients !== null) ? data.total_patients : dashboardStats.total_patients,
          avg_los: (data.avg_los !== undefined && data.avg_los !== null) ? data.avg_los : dashboardStats.avg_los,
          readmission_rate: (data.readmission_rate !== undefined && data.readmission_rate !== null) ? data.readmission_rate : dashboardStats.readmission_rate,
          mortality_rate: (data.mortality_rate !== undefined && data.mortality_rate !== null) ? data.mortality_rate : dashboardStats.mortality_rate,
          avg_age: (data.avg_age !== undefined && data.avg_age !== null) ? data.avg_age : dashboardStats.avg_age,
          gender_M: (data.gender_M !== undefined && data.gender_M !== null) ? data.gender_M : dashboardStats.gender_M,
          gender_F: (data.gender_F !== undefined && data.gender_F !== null) ? data.gender_F : dashboardStats.gender_F,
        top_diagnoses: data.top_diagnoses || dashboardStats.top_diagnoses,
        los_distribution: data.los_distribution || dashboardStats.los_distribution,
      }));
      addToast('success', t.dataUpdated);
      const dt = new Date();
      const dateStr = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
      const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setSyncStr(`✅ Mise à jour: ${dateStr} à ${timeStr}`);
      setShowUploadModal(false);
      setUploadFiles({ admissions: null, patients: null, diagnoses: null });
    } catch (err) {
      addToast('error', t.connectionError);
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
      <ToastContainer />

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
              {[
                { key: 'Dashboard', label: t.tabDashboard },
                { key: 'Statistiques', label: t.tabStats },
                { key: 'Triage', label: t.tabTriage },
                { key: 'Rapports', label: t.tabReports }
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-3 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-[#00D4AA] text-[#0B1426] shadow-[0_0_15px_rgba(0,212,170,0.3)] font-bold'
                      : 'text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] hover:bg-[var(--color-chu-header)]'
                  }`}>{label}</button>
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
               title={t.uploadTooltip}
              className="relative px-2 py-2 sm:px-4 sm:py-2 bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-semibold text-sm rounded-lg flex items-center gap-1 sm:gap-2 transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(0,212,170,0.4)] ml-0.5 sm:ml-1 mr-0.5 sm:mr-1">
              <Upload size={16} strokeWidth={2.5} className="shrink-0" /> <span className="hidden md:inline">{t.uploadButton}</span>
              {!dashboardStats.isLocal && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C00] rounded-full animate-pulse border-2 border-[var(--color-chu-header)]"></span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative flex items-center" ref={notifRef}>
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
            apiStatus === 'ONLINE' ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20' : apiStatus === 'CHECKING' ? 'bg-[#E8A020]/10 text-[#E8A020] border border-[#E8A020]/20' : 'bg-[#FF4444]/10 text-[#FF4444] border border-[#FF4444]/20'}`}>
            <span className={`relative flex h-2 w-2`}>
              <span className={`${apiStatus === 'ONLINE' ? 'animate-ping bg-[#00D4AA]' : apiStatus === 'CHECKING' ? 'bg-[#E8A020]' : 'bg-[#FF4444]'} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
              <span className={`${apiStatus === 'ONLINE' ? 'bg-[#00D4AA]' : apiStatus === 'CHECKING' ? 'bg-[#E8A020]' : 'bg-[#FF4444]'} relative inline-flex rounded-full h-2 w-2`}></span>
            </span>
            <span>{apiStatus === 'ONLINE' ? t.apiOnline : apiStatus === 'CHECKING' ? 'VÉRIFICATION...' : t.apiOffline}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 rounded-md font-bold tracking-wide">
            {dashboardStats.isLocal ? t.localData : t.mimicDb}
          </div>
            <div className="hidden md:flex items-center gap-2 text-[9px] font-mono">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${syncStr.startsWith("✅") ? 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20' : syncStr.startsWith("⚠") ? 'bg-[#D64545]/10 text-[#D64545] border-[#D64545]/20' : 'bg-[#E8A020]/10 text-[#E8A020] border-[#E8A020]/20'}`}>
                <RefreshCw size={10} className={syncStr.startsWith("⚠") ? '' : 'hidden'} />
                <span className="font-semibold">GOOGLE SHEETS</span>
                <span className="font-medium tracking-wide">{syncStr || <span className="text-[9px] opacity-50">{t.loading}</span>}</span>
                {lastSheetSync && <span className="opacity-70 text-[10px]">({lastSheetSync})</span>}
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-chu-card)] px-3 py-1.5 rounded-md border border-[var(--color-chu-border)]">
          <span className="font-semibold text-[var(--color-chu-text)] uppercase">{lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}</span>
</div>
       </div>




       {/* ═══════════════════════════════════════
           TAB CONTENT (single instance per tab)
          ═══════════════════════════════════════ */}

{activeTab === 'Dashboard' && (
  <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
    <DashboardTab
      darkMode={darkMode}
      t={t}
      dashboardStats={dashboardStats}
      setActiveTab={setActiveTab}
    />
  </div>
)}

{activeTab === 'Statistiques' && (
  <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
    <StatsTab
      darkMode={darkMode}
      t={t}
      dashboardStats={dashboardStats}
    />
  </div>
)}

{activeTab === 'Triage' && (
  <div className="flex flex-col gap-6" style={{ marginTop: `${navbarH + statusBarH}px` }}>
    <TriageTab
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
      readmitForm={readmitForm}
      setReadmitForm={setReadmitForm}
      readmitResult={readmitResult}
      isPredictingReadmit={isPredictingReadmit}
      handleReadmitPredict={handleReadmitPredict}
    />
  </div>
)}

{activeTab === 'Rapports' && (
  <div className="flex flex-col gap-6 max-w-3xl mx-auto" style={{ marginTop: `${navbarH + statusBarH + 24}px` }}>
    <RapportsTab
      dashboardStats={dashboardStats}
      t={t}
      syncStr={syncStr}
      apiStatus={apiStatus}
      handleExport={handleExport}
    />
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
          t={t}
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
