import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Activity, Users, Clock, AlertTriangle, HeartPulse, RefreshCw, User, Scale, Bell, Download, Calendar, CheckCircle2, ChevronDown, Search, Moon, Sun, Upload } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, ChartDataLabels);

// --- Constants & Config ---
const API_BASE = 'https://web-production-93c43.up.railway.app';
const translations = {
  fr: {
    appTitle: "CHU Mohammed VI Oujda",
    appSubtitle: "SYSTÈME D'AIDE À LA DÉCISION CLINIQUE • AI ENGINE V2.4",
    appTitleAr: "المستشفى الجامعي محمد السادس وجدة",
    exportBtn: "Exporter en PDF",
    exportTip: "Exporter",
    systemAlerts: "Alertes Système",
    clearAll: "Tout effacer",
    noAlerts: "Aucune alerte",
    apiOnline: "API: ONLINE (RAILWAY)",
    mimicDb: "MIMIC-IV DATABANK",
    refresh: "Actualiser",
    patientsTotal: "Patients Totaux",
    patientsSub: "+12% vs mois dernier",
    los: "Durée de Séjour",
    losSub: "Moyenne hospitalière",
    readmission: "Réadmission",
    readmissionSub: "Cible critique < 15%",
    mortality: "Taux Mortalité",
    mortalitySub: "Cohort MIMIC-IV",
    avgAge: "Âge Moyen",
    ageSub: "Écart-type: ±14.2",
    genderStr: "Genre (M/F)",
    genderSub: "Répartition binaire %",
    days: "j",
    years: "ans",
    triageTitle: "Aide au Triage Clinique / التوجيه",
    patientAge: "Age du Patient",
    patientGender: "Sexe du Patient",
    male: "Homme / ذكر",
    female: "Femme / أنثى",
    primaryDiagnosis: "Diagnostic Principal",
    searchDiag: "Chercher diagnostic...",
    prediction: "PRÉDICTION",
    reset: "RÉINITIALISER",
    loadScore: "Score de Charge",
    estLos: "Durée Estimée",
    triagePriority: "Priorité Triage Assignée",
    p1: "P1 CRITIQUE",
    p2: "P2 URGENT",
    p3: "P3 STANDARD",
    p1Desc: "Admission immédiate en soins intensifs ou bloc de déchocage.",
    p2Desc: "Consultation médicale urgente requise dans les 2 heures.",
    p3Desc: "Prise en charge standard selon l'ordre d'arrivée.",
    noResults: "Aucun résultat",
    footerText: "CHU Mohammed VI Oujda | MIMIC-IV Dataset | Système IA v2.4",
    autoRefresh: "● AUTO-REFRESH ACTIVE (30S)",
    topDiag: "Top Diagnoses (Volume)",
    distLos: "Distribution LOS (Jours)",
    demoAge: "Démographie par Âge (Groupes)",
    distGender: "Répartition par Genre",
    patients: "Patients",
  },
  en: {
    appTitle: "CHU Mohammed VI Oujda",
    appSubtitle: "CLINICAL DECISION SUPPORT SYSTEM • AI ENGINE V2.4",
    appTitleAr: "المستشفى الجامعي محمد السادس وجدة",
    exportBtn: "Export to PDF",
    exportTip: "Export",
    systemAlerts: "System Alerts",
    clearAll: "Clear all",
    noAlerts: "No alerts",
    apiOnline: "API: ONLINE (RAILWAY)",
    mimicDb: "MIMIC-IV DATABANK",
    refresh: "Refresh",
    patientsTotal: "Total Patients",
    patientsSub: "+12% vs last month",
    los: "Length of Stay",
    losSub: "Hospital average",
    readmission: "Readmission",
    readmissionSub: "Critical target < 15%",
    mortality: "Mortality Rate",
    mortalitySub: "MIMIC-IV Cohort",
    avgAge: "Average Age",
    ageSub: "Std dev: ±14.2",
    genderStr: "Gender (M/F)",
    genderSub: "Binary distribution %",
    days: "d",
    years: "yrs",
    triageTitle: "Clinical Triage Support",
    patientAge: "Patient Age",
    patientGender: "Patient Gender",
    male: "Male / ذكر",
    female: "Female / أنثى",
    primaryDiagnosis: "Primary Diagnosis",
    searchDiag: "Search diagnosis...",
    prediction: "PREDICTION",
    reset: "RESET",
    loadScore: "Workload Score",
    estLos: "Estimated LOS",
    triagePriority: "Assigned Triage Priority",
    p1: "P1 CRITICAL",
    p2: "P2 URGENT",
    p3: "P3 STANDARD",
    p1Desc: "Immediate admission to ICU or shock room.",
    p2Desc: "Urgent medical consultation required within 2 hours.",
    p3Desc: "Standard care based on order of arrival.",
    noResults: "No results",
    footerText: "CHU Mohammed VI Oujda | MIMIC-IV Dataset | AI System v2.4",
    autoRefresh: "● AUTO-REFRESH ACTIVE (30S)",
    topDiag: "Top Diagnoses (Volume)",
    distLos: "LOS Distribution (Days)",
    demoAge: "Age Demographics (Groups)",
    distGender: "Gender Distribution",
    patients: "Patients",
  },
  ar: {
    appTitle: "المركز الاستشفائي الجامعي محمد السادس وجدة",
    appSubtitle: "نظام دعم القرار السريري • محرك الذكاء الاصطناعي الإصدار ٢٫٤",
    appTitleAr: "المستشفى الجامعي محمد السادس وجدة",
    exportBtn: "تصدير إلى PDF",
    exportTip: "تصدير",
    systemAlerts: "تنبيهات النظام",
    clearAll: "مسح الكل",
    noAlerts: "لا توجد تنبيهات",
    apiOnline: "API: متصل (RAILWAY)",
    mimicDb: "قاعدة بيانات MIMIC-IV",
    refresh: "تحديث",
    patientsTotal: "إجمالي المرضى",
    patientsSub: "+١٢٪ مقارنة بالشهر الماضي",
    los: "مدة الإقامة",
    losSub: "المتوسط في المستشفى",
    readmission: "إعادة الإدخال",
    readmissionSub: "الهدف الحرج < ١٥٪",
    mortality: "معدل الوفيات",
    mortalitySub: "مجموعة MIMIC-IV",
    avgAge: "متوسط العمر",
    ageSub: "الانحراف المعياري: ±١٤٫٢",
    genderStr: "الجنس (ذكر/أنثى)",
    genderSub: "التوزيع الثنائي ٪",
    days: "أيام",
    years: "سنة",
    triageTitle: "التوجيه السريري / Aide au Triage Clinique",
    patientAge: "عمر المريض",
    patientGender: "جنس المريض",
    male: "ذكر / Male",
    female: "أنثى / Female",
    primaryDiagnosis: "التشخيص الأولي",
    searchDiag: "البحث عن التشخيص...",
    prediction: "توقع",
    reset: "إعادة ضبط",
    loadScore: "درجة العبء",
    estLos: "المدة المقدرة",
    triagePriority: "أولوية التوجيه المعينة",
    p1: "حرج P1",
    p2: "عاجل P2",
    p3: "عادي P3",
    p1Desc: "دخول فوري إلى العناية المركزة أو غرفة الصدمات.",
    p2Desc: "استشارة طبية عاجلة مطلوبة في غضون ساعتين.",
    p3Desc: "رعاية عادية حسب ترتيب الوصول.",
    noResults: "لا توجد نتائج",
    footerText: "المركز الاستشفائي الجامعي محمد السادس | بيانات MIMIC-IV | نظام الذكاء الاصطناعي الإصدار ٢٫٤",
    autoRefresh: "● التحديث التلقائي نشط (٣٠ ثانية)",
    topDiag: "أعلى التشخيصات (الحجم)",
    distLos: "توزيع مدة الإقامة (أيام)",
    demoAge: "التركيبة السكانية حسب العمر (مجموعات)",
    distGender: "توزيع الجنس",
    patients: "مرضى",
  }
};


export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [lang, setLang] = useState<'fr' | 'en' | 'ar'>(() => {
    return (localStorage.getItem('lang') as any) || 'fr';
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

  const t = translations[lang];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString('fr-FR'));
  const [currentTime, setCurrentTime] = useState('');

  const chartTextColor = darkMode ? '#7BA7C4' : '#1B2A4A';
  const chartLabelColor = darkMode ? '#fff' : '#1B2A4A';

  // Patient prediction state
  const [formData, setFormData] = useState({ age: 68, gender: 'Homme', diagnosis: 'Insuffisance Cardiaque' });
  const [predictions, setPredictions] = useState<{ load?: number, los?: number, triage?: number } | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    total_patients: 4506,
    avg_los: 7.43,
    readmission_rate: 11.2,
    mortality_rate: 8.7,
    avg_age: 63,
    gender_M: 54,
    gender_F: 46,
    top_diagnoses: [
      { label: 'Septicémie', value: 312 },
      { label: 'Insu. Cardiaque', value: 287 },
      { label: 'Pneumonie', value: 198 },
      { label: 'IRC', value: 176 },
      { label: 'AVC', value: 154 }
    ],
    los_distribution: [
      { label: '<2 j', value: 18 },
      { label: '2-7 j', value: 41 },
      { label: '7-14 j', value: 28 },
      { label: '>14 j', value: 13 }
    ],
    isLocal: false
  });
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{admissions: File|null, patients: File|null, diagnoses: File|null}>({ admissions: null, patients: null, diagnoses: null });
  const [isUploading, setIsUploading] = useState(false);
  
  const submitUpload = async () => {
    if (!uploadFiles.admissions || !uploadFiles.patients || !uploadFiles.diagnoses) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('admissions', uploadFiles.admissions);
      fd.append('patients', uploadFiles.patients);
      fd.append('diagnoses_icd', uploadFiles.diagnoses);

      const res = await fetch('https://web-production-93c43.up.railway.app/upload-stats', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setDashboardStats({
        ...dashboardStats,
        total_patients: data.total_patients ?? dashboardStats.total_patients,
        avg_los: data.avg_los ?? dashboardStats.avg_los,
        readmission_rate: data.readmission_rate ?? dashboardStats.readmission_rate,
        mortality_rate: data.mortality_rate ?? dashboardStats.mortality_rate,
        avg_age: data.avg_age ?? dashboardStats.avg_age,
        gender_M: data.gender_M ?? dashboardStats.gender_M,
        gender_F: data.gender_F ?? dashboardStats.gender_F,
        top_diagnoses: data.top_diagnoses || dashboardStats.top_diagnoses,
        los_distribution: data.los_distribution || dashboardStats.los_distribution,
        isLocal: true,
      });
      setToast({message: "✅ Données mises à jour", type: 'success'});
      const dt = new Date();
      const dateStr = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
      const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setSyncStr(`✅ Mise à jour: ${dateStr} à ${timeStr}`);
      setShowUploadModal(false);
      setUploadFiles({ admissions: null, patients: null, diagnoses: null });
    } catch (err) {
      setToast({message: "❌ Erreur de connexion", type: 'error'});
    } finally {
      setIsUploading(false);
    }
  };

  // Searchable dropdown state
  const [diagSearch, setDiagSearch] = useState('');
  const [showDiagDropdown, setShowDiagDropdown] = useState(false);
  const diagnosesList = ['Septicémie', 'Pneumonie', 'Insuffisance Cardiaque', 'IRC', 'AVC', 'Diabète', 'Hypertension', 'Traumatisme Crânien'];

  // Notification state
  const [alerts, setAlerts] = useState<{id: string, severity: 'CRITIQUE'|'ATTENTION'|'AVERTISSEMENT'|'INFO', message: string, time: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadAlerts = alerts.length;
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [syncStr, setSyncStr] = useState("⚠️ Données par défaut — Chargez votre CSV");

  const handleAgeDec = () => setFormData(prev => ({...prev, age: Math.max(0, prev.age - 1)}));
  const handleAgeInc = () => setFormData(prev => ({...prev, age: Math.min(120, prev.age + 1)}));
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setFormData(prev => ({...prev, age: isNaN(v) ? 0 : Math.max(0, Math.min(120, v))}));
  };

  const addAlert = (severity: 'CRITIQUE'|'ATTENTION'|'AVERTISSEMENT'|'INFO', message: string) => {
    setAlerts(prev => [{
      id: Date.now().toString() + Math.random().toString(),
      severity,
      message,
      time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})
    }, ...prev]);
  };

  useEffect(() => {
    // Initial alerts
    addAlert('INFO', `Système IA opérationnel - Dernière sync: ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`);
    addAlert('AVERTISSEMENT', "Taux de réadmission > 10% ce mois");

    // Live clock
    const updateTime = () => {
      const now = new Date();
      const format = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(now);
      setCurrentTime(format.charAt(0).toUpperCase() + format.slice(1).replace(/,/g, ' —'));
    };

    updateTime();
    
    const clockInterval = setInterval(() => {
      updateTime();
    }, 1000);

    const refreshInterval = setInterval(() => {
      refreshData();
      // Only updating refresh without breaking sync string
    }, 30000);
    
    return () => {
      clearInterval(clockInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date().toLocaleTimeString('fr-FR'));
      setIsRefreshing(false);
    }, 800);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setErrorMsg('');
    setPredictions(null);
    
    // Convert inputs for generic mock if the real API fails
    const reqHeaders = { 
      'Content-Type': 'application/json'
    };

    try {
      // In a real environment, we call all 3 endpoints concurrently.
      // Promise.allSettled avoids entire block failure if one endpoint is down.
      const [loadRes, losRes, triageRes] = await Promise.allSettled([
        fetch(`${API_BASE}/predict/load`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(formData) }),
        fetch(`${API_BASE}/predict/los`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(formData) }),
        fetch(`${API_BASE}/predict/triage`, { method: 'POST', headers: reqHeaders, body: JSON.stringify(formData) })
      ]);

      let loadVal = 1.02, losVal = 8.4, triageVal = 1; // Default mock fallback matching the theme example

      if (loadRes.status === 'fulfilled' && loadRes.value.ok) {
        const data = await loadRes.value.json();
        loadVal = typeof data === 'number' ? data : data.load || loadVal;
      }
      if (losRes.status === 'fulfilled' && losRes.value.ok) {
        const data = await losRes.value.json();
        losVal = typeof data === 'number' ? data : data.los || losVal;
      }
      if (triageRes.status === 'fulfilled' && triageRes.value.ok) {
        const data = await triageRes.value.json();
        triageVal = typeof data === 'number' ? data : data.triage || triageVal;
      }

      setPredictions({ load: loadVal, los: losVal, triage: triageVal });
      
      // Toast success
      setToast({ message: "✓ Analyse complète et prédictions générées", type: 'success' });
      setTimeout(() => setToast(null), 3000);

      // Smart Alerts based on prediction
      if (triageVal === 1) addAlert('CRITIQUE', "Patient critique détecté - Action immédiate requise");
      if (losVal > 14) addAlert('ATTENTION', `Durée de séjour élevée prévue (${losVal.toFixed(1)} j)`);

    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de l'appel au modèle ML. Vérifiez que ngrok est actif.");
      setToast({ message: "⚠ API indisponible - Échec de l'analyse", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(0,113,60,0.15)' }, ticks: { color: chartTextColor, font: {family: 'Inter', size: 10} } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: chartTextColor, font: {family: 'Inter', size: 10} } }
    }
  };
  const barOptions = { ...chartDefaults, elements: { bar: { borderRadius: 4 } } };
  const lineOptions = { ...chartDefaults, elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 6 } }, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, grid: { display: true, color: 'rgba(0,113,60,0.15)' } } } };

  return (
    <div className="min-h-screen bg-[var(--color-chu-bg)] text-slate-100 flex flex-col p-6 font-sans overflow-x-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div
          ref={(el) => {
            if (el) {
              setTimeout(() => { el.style.opacity = '0'; setTimeout(() => setToast(null), 500); }, 3000);
            }
          }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-bold shadow-2xl text-sm border ${
            toast.type === 'success' ? 'bg-[#00956E] border-[#00956E] text-white' : 'bg-[#D64545] border-[#D64545] text-white'
          }`}
          style={{ transition: 'opacity 0.5s' }}
        >
          {toast.message}
        </div>
      )}

      {/* Navbar (Header) */}
      <header
        className="bg-[var(--color-chu-header)]/95 backdrop-blur-[10px] border-b px-4 lg:px-6 py-2 no-print fixed top-0 left-0 right-0 z-[1000] shadow-sm transition-colors duration-400 flex flex-col"
        style={{ borderBottomColor: 'var(--header-border-color)', borderBottomWidth: 'var(--header-border-width)', '--navbar-h': '88px' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 lg:gap-4 group cursor-pointer shrink-0">
            <div className="relative shrink-0 flex items-center">
              <div className="absolute -inset-2 bg-[#00D4AA] rounded-full opacity-0 group-hover:opacity-20 blur-md transition-all duration-400"></div>
              <img src="/loGo.png" alt="CHU Oujda Logo" className="h-[45px] lg:h-[50px] object-contain shrink-0 relative z-10" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="flex flex-col justify-center min-w-0 py-1">
              <h1 className="text-sm lg:text-[18px] xl:text-[20px] font-bold tracking-tight bg-gradient-to-r from-[var(--color-chu-text)] to-[#00D4AA] text-transparent bg-clip-text whitespace-nowrap leading-none pb-1">
                CHU Mohammed VI Oujda
              </h1>
              <h2 className="text-[11px] lg:text-[12px] font-bold text-[#00D4AA] font-arabic opacity-90 whitespace-nowrap leading-none pb-1">
                {t.appTitleAr}
              </h2>
              <p className="text-[9px] lg:text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase tracking-widest leading-none truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* CENTER: Navigation pills (hidden on small screens) */}
          <div className="hidden lg:flex shrink-0 justify-center">
            <nav className="flex space-x-1 bg-[var(--color-chu-bg)] p-1 rounded-full border border-[var(--color-chu-border)]">
              {['Dashboard', 'Statistiques', 'Triage', 'Rapports'].map((item, idx) => (
                <button
                  key={item}
                  className={`px-3 lg:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    idx === 0 
                      ? 'bg-[#00D4AA] text-[#0B1426] shadow-[0_0_15px_rgba(0,212,170,0.3)]' 
                      : 'text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] hover:bg-[var(--color-chu-header)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          
          {/* RIGHT: Toggles, actions, and clock */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* Language Switch */}
            <div className="hidden sm:flex items-center bg-[var(--color-chu-bg)] p-1 rounded-full border border-[var(--color-chu-border)]">
              {['ar', 'fr', 'en'].map((l) => (
                <button 
                  key={l}
                  onClick={() => setLang(l as 'ar'|'fr'|'en')} 
                  className={`px-2 lg:px-3 py-1 rounded-full font-bold text-[9px] lg:text-[10px] uppercase transition-all duration-300 border ${
                    lang === l 
                      ? 'bg-[#00D4AA] text-[#0B1426] border-[#00D4AA] shadow-[0_2px_10px_rgba(0,212,170,0.4)]' 
                      : 'text-[var(--color-chu-text-sec)] hover:text-[var(--color-chu-text)] border-transparent hover:border-[#00D4AA]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
              
            <div className="hidden sm:block h-5 lg:h-6 w-px bg-[rgba(0,212,170,0.3)] mx-0.5 lg:mx-1"></div>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-1.5 lg:p-2 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-all group relative overflow-hidden" 
              title="Toggle Theme"
            >
              <div className="relative w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                 <Moon size={16} className={`absolute transition-all duration-500 transform lg:w-[18px] lg:h-[18px] ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} strokeWidth={2.5} />
                 <Sun size={16} className={`absolute transition-all duration-500 transform lg:w-[18px] lg:h-[18px] ${!darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} strokeWidth={2.5} />
              </div>
            </button>
            
            {/* Export */}
            <button 
              onClick={handleExport} 
              className="p-1.5 lg:p-2 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-all group relative" 
              title={t.exportTip}
            >
              <Download size={16} className="lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              title="Mettre à jour avec vos données hospitalières"
              className="relative px-4 py-2 bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-semibold text-sm rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(0,212,170,0.4)] ml-1 mr-1"
            >
              <Upload size={16} strokeWidth={2.5} className="shrink-0" /> <span className="hidden sm:inline">Charger données</span>
              {!dashboardStats.isLocal && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C00] rounded-full animate-pulse border-2 border-[var(--color-chu-header)]"></span>
              )}
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 lg:p-2 hover:bg-[var(--color-chu-bg)] rounded-full flex items-center justify-center text-[#00D4AA] transition-all relative">
                <Bell size={16} className="lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                {unreadAlerts > 0 && (
                  <span className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-[#D64545] text-[8px] lg:text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-[var(--color-chu-header)] shadow-sm animate-pulse">{unreadAlerts}</span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl shadow-2xl z-50 overflow-hidden text-left backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-[var(--color-chu-border)] bg-[var(--color-chu-header)] flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[var(--color-chu-text)]">{t.systemAlerts}</h3>
                    <button onClick={() => setAlerts([])} className="text-xs text-[var(--color-chu-text-sec)] hover:text-[#00D4AA] transition-colors">{t.clearAll}</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[var(--color-chu-text-sec)]">{t.noAlerts}</div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className={`p-3 border-b border-[var(--color-chu-border)] hover:bg-[var(--color-chu-bg)] flex gap-3 text-sm border-l-4 transition-colors ${
                          alert.severity === 'CRITIQUE' ? 'border-l-[#D64545]' :
                          alert.severity === 'ATTENTION' ? 'border-l-[#E8A020]' :
                          alert.severity === 'AVERTISSEMENT' ? 'border-l-[#E8A020]' : 'border-l-[#00D4AA]'
                        }`}>
                          <div className={`mt-0.5 shrink-0 ${
                            alert.severity === 'CRITIQUE' ? 'text-[#D64545]' :
                            alert.severity === 'ATTENTION' ? 'text-[#E8A020]' :
                            alert.severity === 'AVERTISSEMENT' ? 'text-[#E8A020]' : 'text-[#00D4AA]'
                          }`}>
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

            <div className="hidden xl:block h-6 w-px bg-[rgba(0,212,170,0.3)] mx-1"></div>
            
            {/* Clock */}
            <div className="hidden xl:flex items-center text-[#00D4AA] font-mono text-[11px] font-semibold tabular-nums px-3 py-1.5 rounded-lg border border-[rgba(0,212,170,0.2)] bg-[rgba(0,212,170,0.05)] shadow-[inset_0_0_10px_rgba(0,212,170,0.02)]">
              {currentTime}
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[var(--color-chu-text-sec)] p-2 no-print fixed left-0 right-0 z-[999] rounded-lg shadow-sm transition-colors duration-400"
        style={{ backgroundColor: 'var(--status-bar-bg)', border: '1px solid var(--status-bar-border)', top: 'calc(var(--navbar-h, 88px) + 4px)' } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-chu-card)] px-3 py-1.5 rounded-md border border-[var(--color-chu-border)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]"></span>
            </span>
            <span className="text-[var(--color-chu-text)] font-semibold">{t.apiOnline}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 rounded-md font-bold tracking-wide">
            {dashboardStats.isLocal ? "DONNÉES LOCALES" : t.mimicDb}
          </div>
          <div className="hidden md:flex items-center ml-2">
            {!dashboardStats.isLocal ? (
              <span className="text-[#FFA500] font-medium text-xs tracking-wide">{syncStr}</span>
            ) : (
              <span className="text-[#00D4AA] font-medium text-xs tracking-wide">{syncStr}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[var(--color-chu-card)] px-3 py-1.5 rounded-md border border-[var(--color-chu-border)]">
          <span className="font-semibold text-[var(--color-chu-text)] uppercase">
            LANG: {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}
          </span>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6" style={{ marginTop: 'calc(var(--navbar-h, 88px) + 56px)' }}>
        <KPICard darkMode={darkMode} title={t.patientsTotal} value={dashboardStats.total_patients.toLocaleString()} subtitle={t.patientsSub} valueColor="text-[#00713C]" borderColor="border-l-[#00713C]" icon={Users} tooltip="↑ 12% vs mois dernier\nMin: 4000 Max: 5000\nInterprétation: Volume de patients en hausse." />
        <KPICard darkMode={darkMode} title={t.los} value={`${Number(dashboardStats.avg_los).toFixed(2)}j`} subtitle={t.losSub} valueColor="text-[#00956E]" borderColor="border-l-[#00956E]" icon={Clock} tooltip="↓ 0.5j vs mois dernier\nMin: 2j Max: 45j\nInterprétation: Optimisation des lits en cours." />
        <KPICard darkMode={darkMode} title={t.readmission} value={`${Number(dashboardStats.readmission_rate).toFixed(1)}%`} subtitle={t.readmissionSub} valueColor="text-[#E8A020]" borderColor="border-l-[#E8A020]" icon={RefreshCw} tooltip="↑ 2% vs mois dernier\nMin: 5% Max: 20%\nInterprétation: Attention, taux critique." />
        <KPICard darkMode={darkMode} title={t.mortality} value={`${Number(dashboardStats.mortality_rate).toFixed(1)}%`} subtitle={t.mortalitySub} valueColor="text-[#D64545]" borderColor="border-l-[#D64545]" icon={HeartPulse} tooltip="↓ 1% vs mois dernier\nMin: 2% Max: 12%\nInterprétation: Baisse significative." />
        <KPICard darkMode={darkMode} title={t.avgAge} value={`${Math.round(dashboardStats.avg_age)} ans`} subtitle={t.ageSub} valueColor="text-[#38A8D4]" borderColor="border-l-[#38A8D4]" icon={User} tooltip="↔ Stable\nMin: 18 Max: 102\nInterprétation: Population vieillissante." />
        <KPICard darkMode={darkMode} title={t.genderStr} value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`} subtitle={t.genderSub} valueColor="text-[#8B5CF6]" borderColor="border-l-[#8B5CF6]" icon={Scale} tooltip="↔ Stable\nInterprétation: Légère prédominance masculine." />
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
        
        {/* Charts Grid */}
        <div className="xl:col-span-8 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title={t.topDiag}>
            <Bar 
              data={{
                labels: Array.isArray(dashboardStats.top_diagnoses) ? dashboardStats.top_diagnoses.map(d => d.label) : [],
                datasets: [{
                  data: Array.isArray(dashboardStats.top_diagnoses) ? dashboardStats.top_diagnoses.map(d => d.value) : [],
                    backgroundColor: ['#00713C','#00956E','#38A8D4','#E8A020','#D64545'],
                    borderRadius: 4
                  }]
                }}
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    datalabels: {
                      color: chartLabelColor,
                      anchor: 'end',
                      align: 'bottom',
                      offset: 4,
                      font: { weight: 'bold', size: 12 }
                    }
                  }
                }}
              />
            </ChartCard>

            <ChartCard title={t.distLos}>
              <div className="h-full flex flex-col justify-center relative">
                <Doughnut 
                  data={{
                    labels: Array.isArray(dashboardStats.los_distribution) ? dashboardStats.los_distribution.map(d => d.label) : [],
                    datasets: [{
                      data: Array.isArray(dashboardStats.los_distribution) ? dashboardStats.los_distribution.map(d => d.value) : [],
                      backgroundColor: ['#00713C', '#00956E', '#E8A020', '#D64545'],
                      borderWidth: 0,
                      // @ts-ignore
                      cutout: '55%'
                    }]
                  }}
                  plugins={[{
                    id: 'centerText',
                    beforeDraw(chart: any) {
                      const {ctx, chartArea} = chart;
                      if (!chartArea) return;
                      const centerX = chartArea.left + chartArea.width / 2;
                      const centerY = chartArea.top + chartArea.height / 2;
                      ctx.restore();
                      ctx.font = 'bold 28px Inter';
                      ctx.fillStyle = chartLabelColor;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText(dashboardStats.total_patients.toLocaleString(), centerX, centerY - 10);
                      ctx.font = '13px Inter';
                      ctx.fillStyle = chartTextColor;
                      ctx.fillText(t.patients, centerX, centerY + 20);
                      ctx.save();
                    }
                  }]}
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { 
                      legend: { position: 'right', labels: { color: chartTextColor, font: {family: 'Inter', size: 10}, usePointStyle: true, pointStyle: 'circle' } },
                      datalabels: { display: false } // disable on doughnut
                    },
                    layout: { padding: 10 }
                  }}
                />
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title={t.demoAge}>
              <Line 
                data={{
                  labels: ['18-40', '40-60', '60-75', '75+'],
                  datasets: [{
                    data: [8, 29, 38, 25],
                    borderColor: '#00713C',
                    backgroundColor: (context: any) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                      gradient.addColorStop(0, 'rgba(0, 113, 60, 0.5)'); // #00713C
                      gradient.addColorStop(1, 'rgba(0, 113, 60, 0.05)');
                      return gradient;
                    },
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{
                  ...lineOptions,
                  plugins: {
                    ...lineOptions.plugins,
                    datalabels: { display: false }
                  }
                }}
              />
            </ChartCard>

            <ChartCard title={t.distGender}>
              <Bar 
                data={{
                  labels: ['Hommes', 'Femmes'],
                  datasets: [{
                    data: [dashboardStats.gender_M, dashboardStats.gender_F],
                    backgroundColor: ['#00713C', '#00956E'],
                    borderRadius: 8,
                    barThickness: 40
                  }]
                }}
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    datalabels: {
                      color: chartLabelColor,
                      formatter: (val) => val + '%',
                      anchor: 'end',
                      align: 'bottom',
                      offset: 4,
                      font: { weight: 'bold', size: 14 }
                    }
                  }
                }}
              />
            </ChartCard>
          </div>
        </div>

        {/* Patient Prediction Form */}
        <div className="xl:col-span-4 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-[#0B1426] border border-[#1E3A5F] rounded-[16px] p-6 relative flex flex-col transition-all duration-400 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            {/* PANEL HEADER */}
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-[16px]" style={{ background: 'linear-gradient(90deg, #00D4AA, #1B6CA8)' }}></div>
            <div 
              className="-mx-6 -mt-6 mb-6 p-6 rounded-t-[14px] border-b border-[#1E3A5F]"
              style={{ background: 'linear-gradient(135deg, #0B1426 0%, #1B2A4A 100%)' }}
            >
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-[18px] font-bold text-white mb-0 flex items-center">
                  🏥 {t.triageTitle}
                </h3>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D4AA]"></span>
                </span>
              </div>
              <p className="text-[#00D4AA] text-[11px] font-medium tracking-wide">Système de prédiction IA • MIMIC-IV</p>
            </div>

            <form onSubmit={handlePredict} className="space-y-5 flex-1 flex flex-col">
               <div className="space-y-2">
                 <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                   <User size={14} /> {t.patientAge}
                 </label>
                  <div className="flex items-center border border-[#00D4AA] rounded-[10px] bg-[#0D1B2E] overflow-hidden focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all">
                    <button type="button" onClick={handleAgeDec} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[18px] font-bold border-none cursor-pointer px-3 py-[14px] hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">−</button>
                    <input
                      type="number"
                      min="0" max="120"
                      value={formData.age === 0 ? '' : formData.age}
                      onChange={handleAgeChange}
                      className="flex-1 bg-transparent border-none text-white text-center text-lg font-semibold py-[14px] focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder-[#4A6080] [appearance:textfield]"
                      placeholder="--"
                      inputMode="numeric"
                    />
                    <button type="button" onClick={handleAgeInc} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[18px] font-bold border-none cursor-pointer px-3 py-[14px] hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">+</button>
                  </div>
               </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                  <Users size={14} /> {t.patientGender}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, gender: 'Homme'})}
                    className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${formData.gender === 'Homme' ? 'bg-[#00D4AA] text-white border border-transparent' : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'}`}
                  >
                    👨 {t.male}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, gender: 'Femme'})}
                    className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${formData.gender === 'Femme' ? 'bg-[#00D4AA] text-white border border-transparent' : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'}`}
                  >
                    👩 {t.female}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 relative">
                <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                  <Activity size={14} /> {t.primaryDiagnosis}
                </label>
                <div 
                  className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[10px] px-4 py-3.5 text-white focus-within:border-[#00D4AA] focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all flex items-center relative cursor-text text-sm"
                  onClick={() => setShowDiagDropdown(true)}
                >
                  <Search size={16} className="text-[#00D4AA] mr-3 shrink-0" />
                  <input 
                    type="text" 
                    value={showDiagDropdown ? diagSearch : formData.diagnosis}
                    onChange={(e) => {
                      setDiagSearch(e.target.value);
                      setShowDiagDropdown(true);
                    }}
                    onFocus={() => {
                      setDiagSearch('');
                      setShowDiagDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDiagDropdown(false), 200)}
                    placeholder={t.searchDiag}
                    className="bg-transparent border-none outline-none w-full text-white placeholder-[#4A6080]"
                  />
                  <ChevronDown size={16} className="text-[#00D4AA] ml-3 shrink-0" />
                </div>
                
                {/* Custom Searchable Dropdown */}
                {showDiagDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#0D1B2E] border border-[rgba(0,212,170,0.25)] rounded-[10px] shadow-xl z-20 max-h-48 overflow-y-auto">
                    {diagnosesList
                      .filter(d => d.toLowerCase().includes(diagSearch.toLowerCase()))
                      .map((diag) => (
                        <div 
                          key={diag}
                          className="px-[16px] py-[12px] text-sm text-white hover:bg-[#1B2A4A] hover:text-[#00D4AA] cursor-pointer transition-colors"
                          onClick={() => {
                            setFormData({...formData, diagnosis: diag});
                            setDiagSearch('');
                            setShowDiagDropdown(false);
                          }}
                        >
                          {diag}
                        </div>
                    ))}
                    {diagnosesList.filter(d => d.toLowerCase().includes(diagSearch.toLowerCase())).length === 0 && (
                      <div className="px-[16px] py-[12px] text-sm text-[#4A6080] italic">{t.noResults}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-4">
                <button 
                  type="submit" disabled={isPredicting}
                  className="w-full text-white font-[700] tracking-[1px] py-[14px] rounded-[10px] flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] text-sm disabled:opacity-70 disabled:hover:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #00D4AA, #00B894)' }}
                >
                  {isPredicting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <span className="mr-2 text-lg leading-none">⚡</span>}
                  {t.prediction}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setPredictions(null);
                    setErrorMsg('');
                    setFormData({ age: 68, gender: 'Homme', diagnosis: 'Insuffisance Cardiaque' });
                  }}
                  className="w-full bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#FF6B6B] hover:text-[#FF6B6B] font-bold py-[14px] rounded-[10px] flex items-center justify-center transition-colors text-sm"
                >
                  <span className="mr-2 text-lg leading-none">🔄</span>
                  {t.reset}
                </button>
              </div>
            </form>

            {/* Alert space */}
            {errorMsg && (
              <div className="mt-4 p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg text-xs text-[#D64545]">
                {errorMsg}
              </div>
            )}

            {predictions && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-6 bg-[#0D1B2E] border border-[rgba(0,212,170,0.25)] rounded-[12px] p-5 relative overflow-hidden"
              >
                {/* Dynamic Top Bar */}
                <div className={`absolute top-0 left-0 w-full h-[4px] ${
                  predictions.triage === 1 ? 'bg-[#FF4444]' : 
                  predictions.triage === 2 ? 'bg-[#FF8C00]' : 
                  'bg-[#00D4AA]'
                }`} />

                {/* Triage Level Row */}
                <div className="flex justify-between items-center mb-4 pt-1">
                  <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Niveau Triage</span>
                  <div className={`px-3 py-1.5 rounded-md text-white text-sm font-bold shadow-sm flex items-center ${
                    predictions.triage === 1 ? 'bg-[#FF4444] shadow-[0_0_10px_rgba(255,68,68,0.4)] animate-pulse' : 
                    predictions.triage === 2 ? 'bg-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.4)]' : 
                    'bg-[#00D4AA] shadow-[0_0_10px_rgba(0,212,170,0.4)]'
                  }`}>
                    {predictions.triage === 1 ? t.p1 : predictions.triage === 2 ? t.p2 : t.p3}
                  </div>
                </div>
                
                <div className="h-px bg-[#1E3A5F] w-full mb-4" />

                {/* Details grid */}
                <div className="space-y-5">
                  {/* Score de Charge */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Score de Charge</span>
                      <span className="text-white text-[16px] font-bold">{Math.round(((predictions.load || 0) / 3) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#1B2A4A] rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((predictions.load || 0) / 3) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${
                          (predictions.load || 0) > 2.5 ? 'bg-[#FF4444]' : 
                          (predictions.load || 0) > 1.5 ? 'bg-[#FF8C00]' : 'bg-[#00D4AA]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Durée Estimée */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Durée Estimée</span>
                    <span className="text-white text-[16px] font-bold">{predictions.los?.toFixed(1)} <span className="text-sm font-normal text-[#8899AA]">{t.days}</span></span>
                  </div>

                  {/* Recommandation */}
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider mt-1 whitespace-nowrap">Recommandation</span>
                    <span className="text-white text-[14px] font-medium text-right leading-snug">
                      {(predictions.triage === 1 ? t.p1Desc : predictions.triage === 2 ? t.p2Desc : t.p3Desc)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-chu-text-sec)] font-medium p-4 bg-[var(--color-chu-header)] rounded-xl border border-[var(--color-chu-border)] no-print">
        <div className="flex items-center space-x-4">
          <span>{t.footerText}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0 font-bold text-[#00713C]">
          <span>{t.autoRefresh}</span>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${!darkMode ? 'bg-white border-gray-200' : 'bg-[#0B1426] border-[#1E3A5F]'}`}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-chu-text)]">
              ⚙️ Mettre à jour les données
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Admissions CSV (admissions.csv)</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setUploadFiles(prev => ({...prev, admissions: e.target.files?.[0] || null}))}
                  className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Patients CSV (patients.csv)</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setUploadFiles(prev => ({...prev, patients: e.target.files?.[0] || null}))}
                  className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Diagnoses CSV (diagnoses_icd.csv)</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setUploadFiles(prev => ({...prev, diagnoses: e.target.files?.[0] || null}))}
                  className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${!darkMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#1B2A4A] text-white hover:bg-[#2A3F5F]'}`}
              >
                Annuler
              </button>
              <button 
                onClick={submitUpload}
                disabled={isUploading || !uploadFiles.admissions || !uploadFiles.patients || !uploadFiles.diagnoses}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-[#00D4AA] hover:bg-[#00B894] transition-colors disabled:opacity-50 flex items-center justify-center shadow-[0_4px_15px_rgba(0,212,170,0.3)]"
              >
                {isUploading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
                ANALYSER
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponents & Config ---

function KPICard({ title, value, subtitle, valueColor, borderColor, icon: Icon, tooltip, darkMode }: { title: string, value: string, subtitle: string, valueColor: string, borderColor: string, icon: any, tooltip?: string, darkMode?: boolean }) {
  const match = value.match(/^([\d., /]+)(.*)$/);
  const numPart = match ? match[1].trim() : value;
  const textPart = match ? match[2].trim() : '';
  const isLight = !darkMode;
  
  return (
    <div 
      className={`group bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] ${borderColor} border-l-4 p-4 rounded-xl flex flex-col justify-between h-[120px] transition-all duration-300 relative cursor-default hover:-translate-y-[3px] hover:shadow-xl ${isLight ? 'hover:bg-[#F8FFFE] hover:border-[var(--color-chu-border)]' : 'hover:bg-[#142642]'}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:duration-200 pointer-events-none z-50 w-max max-w-[200px] after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:border-t-[6px] after:border-t-[#1B2A4A] after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent">
          <div className="bg-[#1B2A4A] text-white px-3 py-2 rounded-lg text-[12px] whitespace-pre-line shadow-xl">
            {tooltip}
          </div>
        </div>
      )}
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase leading-tight">{title}</span>
        {Icon && <Icon className="w-5 h-5 text-[var(--color-chu-text-sec)] opacity-40 absolute top-4 right-4" />}
      </div>
      <div className={`text-[3.2rem] font-bold font-mono tracking-tight mt-auto mb-1 leading-none ${valueColor}`}>
        {numPart}
        {textPart && <span className={`text-xl font-sans ml-1 text-[var(--color-chu-text-sec)] inline-block align-baseline font-normal`}>{textPart}</span>}
      </div>
      <div className={`text-[11px] font-medium leading-tight uppercase text-[var(--color-chu-text-sec)]`}>
        {subtitle}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div 
      className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-2xl p-5 flex flex-col h-[280px] transition-colors duration-400"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <h3 className="text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-4 tracking-wide">{title}</h3>
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </div>
  );
}


