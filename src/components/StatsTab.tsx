import React from 'react';
import { Users, Clock, RefreshCw, HeartPulse, User, Scale } from 'lucide-react';
import KPICard from './KPICard';
import ChartCard from './ChartCard';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

interface StatsTabProps {
  darkMode: boolean;
  t: Record<string, string>;
  dashboardStats: any;
}

const StatsTab: React.FC<StatsTabProps> = ({ darkMode, t, dashboardStats }) => {
  const chartTextColor = darkMode ? '#7BA7C4' : '#1B2A4A';
  const chartLabelColor = darkMode ? '#fff' : '#1B2A4A';
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(0,113,60,0.15)' }, ticks: { color: chartTextColor, font: { family: 'Inter', size: 10 } } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: chartTextColor, font: { family: 'Inter', size: 10 } } },
    },
  };
  const barOptions = { ...chartDefaults, elements: { bar: { borderRadius: 4 } } };
  const lineOptions = {
    ...chartDefaults,
    elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 6 } },
    scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, grid: { display: true, color: 'rgba(0,113,60,0.15)' } } },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
          <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.avgLosLabel}</span>
          <div className="text-2xl font-bold text-[#00956E] font-mono mt-1">{(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)} j</div>
        </div>
        <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
          <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.readmission}</span>
          <div className="text-2xl font-bold text-[#E8A020] font-mono mt-1">{(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)} %</div>
        </div>
        <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-4">
          <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase">{t.mortality}</span>
          <div className="text-2xl font-bold text-[#D64545] font-mono mt-1">{(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)} %</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        <KPICard darkMode={darkMode} title={t.patientsTotal} value={dashboardStats.total_patients.toLocaleString()} subtitle={t.patientsSub} valueColor="text-[#00713C]" borderColor="border-l-[#00713C]" icon={Users} />
        <KPICard darkMode={darkMode} title={t.los} value={`${(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)}j`} subtitle={t.losSub} valueColor="text-[#00956E]" borderColor="border-l-[#00956E]" icon={Clock} />
        <KPICard darkMode={darkMode} title={t.readmission} value={`${(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)}%`} subtitle={t.readmissionSub} valueColor="text-[#E8A020]" borderColor="border-l-[#E8A020]" icon={RefreshCw} />
        <KPICard darkMode={darkMode} title={t.mortality} value={`${(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)}%`} subtitle={t.mortalitySub} valueColor="text-[#D64545]" borderColor="border-l-[#D64545]" icon={HeartPulse} />
        <KPICard darkMode={darkMode} title={t.avgAge} value={`${(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans`} subtitle={t.ageSub} valueColor="text-[#38A8D4]" borderColor="border-l-[#38A8D4]" icon={User} />
        <KPICard darkMode={darkMode} title={t.genderStr} value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`} subtitle={t.genderSub} valueColor="text-[#8B5CF6]" borderColor="border-l-[#8B5CF6]" icon={Scale} />
      </div>

      <ChartCard title={t.topDiag}>
        <Bar
          data={{
            labels: (dashboardStats.top_diagnoses ?? []).map((d: any) => d.name),
            datasets: [{ data: (dashboardStats.top_diagnoses ?? []).map((d: any) => d.count), backgroundColor: ['#00713C','#00956E','#38A8D4','#E8A020','#D64545'], borderRadius: 4 }],
          }}
          options={{ ...barOptions, plugins: { ...barOptions.plugins, datalabels: { color: chartLabelColor, anchor: 'end', align: 'bottom', offset: 4, font: { weight: 'bold', size: 12 } } } }}
        />
      </ChartCard>

      <ChartCard title={t.distLos}>
        <div style={{ width: '100%', height: '220px' }}>
          <Doughnut
            data={{
              labels: Array.isArray(dashboardStats.los_distribution)
                ? dashboardStats.los_distribution.map((d: any) => d.label)
                : Object.keys(dashboardStats.los_distribution || {}),
              datasets: [{
                data: Array.isArray(dashboardStats.los_distribution)
                  ? dashboardStats.los_distribution.map((d: any) => d.value)
                  : Object.values(dashboardStats.los_distribution || {}),
                backgroundColor: ['#00D4AA','#3B82F6','#F59E0B','#EF4444'],
                borderWidth: 0,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartLabelColor, font: { family: 'Inter', size: 10 }, padding: 15 } }, datalabels: { color: chartLabelColor, font: { weight: 'bold', size: 11 } } } }}
          />
        </div>
      </ChartCard>

      <ChartCard title={t.losDetail}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-chu-border)]">
                <th className="text-left py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">{t.range}</th>
                <th className="text-right py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">{t.patients}</th>
                <th className="text-right py-2 px-3 font-bold text-[var(--color-chu-text-sec)]">{t.sharePercent}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dashboardStats.los_distribution || {}).map(([label, value]) => {
                const pct = dashboardStats.total_patients > 0 ? ((value as number / dashboardStats.total_patients) * 100).toFixed(1) : '0';
                return (
                  <tr key={label} className="border-b border-[var(--color-chu-border)]/50 hover:bg-[var(--color-chu-bg)]">
                    <td className="py-2 px-3 text-left text-[var(--color-chu-text)]">{label}</td>
                    <td className="py-2 px-3 text-right text-[var(--color-chu-text)] font-semibold">{value}</td>
                    <td className="py-2 px-3 text-right"><span className="text-[#00D4AA] font-bold">{pct}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title={t.demoAge}>
        <Line
          data={{
            labels: ['18-40', '40-60', '60-75', '75+'],
            datasets: [{
              data: [0, 0, 0, 0],
              borderColor: '#00713C',
              backgroundColor: (context: any) => { const ctx = context.chart.ctx; const g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, 'rgba(0, 113, 60, 0.5)'); g.addColorStop(1, 'rgba(0, 113, 60, 0.05)'); return g; },
              fill: true,
              tension: 0.4,
            }],
          }}
          options={{ ...lineOptions, plugins: { ...lineOptions.plugins, datalabels: { display: false } } }}
        />
      </ChartCard>

      <ChartCard title={t.distGender}>
        <div style={{ width: '100%', height: '220px' }}>
          <Doughnut
            data={{
              labels: [t.men, t.women],
              datasets: [{ data: [dashboardStats.gender_M, dashboardStats.gender_F], backgroundColor: ['#3B82F6','#EC4899'], borderWidth: 0 }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartLabelColor, font: { family: 'Inter', size: 10 }, padding: 15 } }, datalabels: { color: chartLabelColor, font: { weight: 'bold', size: 12 } } } }}
          />
        </div>
      </ChartCard>
    </div>
  );
};

export default StatsTab;