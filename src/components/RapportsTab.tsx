import React from 'react';

interface RapportsTabProps {
  dashboardStats: any;
  t: Record<string, string>;
  syncStr: string;
  apiStatus: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  handleExport: () => void;
}

const RapportsTab: React.FC<RapportsTabProps> = ({ dashboardStats, t, syncStr, apiStatus, handleExport }) => (
  <div className="flex flex-col gap-6 max-w-3xl mx-auto">
    <h2 className="text-xl font-bold text-[var(--color-chu-text)]">📄 {t.exportBtn}</h2>

    {/* KPI Summary Card */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.patientsTotal}</span>
        <div className="text-3xl font-bold text-[#00713C] font-mono mt-2">{dashboardStats.total_patients.toLocaleString()}</div>
      </div>
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.los}</span>
        <div className="text-3xl font-bold text-[#00956E] font-mono mt-2">{(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)} j</div>
      </div>
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.readmission}</span>
        <div className="text-3xl font-bold text-[#E8A020] font-mono mt-2">{(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)} %</div>
      </div>
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.mortality}</span>
        <div className="text-3xl font-bold text-[#D64545] font-mono mt-2">{(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)} %</div>
      </div>
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.avgAge}</span>
        <div className="text-3xl font-bold text-[#38A8D4] font-mono mt-2">{(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans</div>
      </div>
      <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.data}</span>
        <div className="text-2xl font-bold text-[#8B5CF6] font-mono mt-2">{dashboardStats.isLocal ? t.local : t.mimicDb}</div>
      </div>
    </div>

    {/* Metadata */}
    <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
        <span className="text-[var(--color-chu-text-sec)] font-semibold">{t.lastUpdate}</span>
        <span className="text-[var(--color-chu-text)] font-mono">{syncStr}</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
        <span className="text-[var(--color-chu-text-sec)] font-semibold">{t.apiStatus}</span>
        <span className={`font-bold font-mono ${apiStatus === 'ONLINE' ? 'text-[#00D4AA]' : apiStatus === 'CHECKING' ? 'text-[#E8A020]' : 'text-[#FF4444]'}`}>{apiStatus === 'ONLINE' ? 'ONLINE (RAILWAY)' : apiStatus === 'CHECKING' ? 'VÉRIFICATION...' : t.apiOffline}</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-[var(--color-chu-border)]">
        <span className="text-[var(--color-chu-text-sec)] font-semibold">{t.mlModel}</span>
        <span className="text-[var(--color-chu-text)] font-mono">{t.noData}</span>
      </div>
    </div>

    {/* Model Performance */}
    <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-6">
      <h3 className="text-sm font-bold text-[var(--color-chu-text)] mb-4 uppercase tracking-wide">{t.modelPerformance}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
          <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">{t.hospitalLoad}</div>
          <div className="text-xl font-bold text-[#00D4AA] font-mono">{t.noData}</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
          <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">{t.lengthOfStay}</div>
          <div className="text-xl font-bold text-[#00D4AA] font-mono">{t.noData}</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-[rgba(0,212,170,0.05)] border border-[rgba(0,212,170,0.15)]">
          <div className="text-[10px] font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">{t.clinicalTriage}</div>
          <div className="text-xl font-bold text-[#00D4AA] font-mono">{t.noData}</div>
        </div>
      </div>
    </div>

    <button onClick={handleExport}
      className="w-full md:w-auto mx-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_4px_16px_rgba(0,212,170,0.4)] text-sm">
      📄 {t.exportBtn}
    </button>
  </div>
);

export default RapportsTab;
