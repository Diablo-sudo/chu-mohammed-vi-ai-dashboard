import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ReadmissionAutoCardProps {
  t: Record<string, string>;
}

export default function ReadmissionAutoCard({ t }: ReadmissionAutoCardProps) {
  // Mock data for automatic risk dashboard
  const riskDistribution = {
    high: { count: 23, label: 'Risque Élevé', percent: '> 40%' },
    moderate: { count: 41, label: 'Risque Modéré', percent: '20–40%' },
    low: { count: 81, label: 'Risque Faible', percent: '< 20%' },
  };

  const topPatients = [
    { id: 'P-1042', age: 78, stay: '12j', risk: 67, severity: 'ÉLEVÉ' },
    { id: 'P-2187', age: 65, stay: '8j',  risk: 58, severity: 'ÉLEVÉ' },
    { id: 'P-0934', age: 71, stay: '15j', risk: 52, severity: 'ÉLEVÉ' },
    { id: 'P-3301', age: 82, stay: '6j',  risk: 49, severity: 'ÉLEVÉ' },
    { id: 'P-1756', age: 69, stay: '11j', risk: 44, severity: 'MODÉRÉ' },
  ];

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'ÉLEVÉ': return '#D64545';
      case 'MODÉRÉ': return '#FF8C00';
      case 'FAIBLE': return '#00D4AA';
      default: return '#777';
    }
  };

  return (
    <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-xl p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[var(--color-chu-text)] font-bold text-lg flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[var(--color-chu-primary)]" /> {t.readmitRisk}
        </h3>
        <span className="bg-[var(--color-chu-primary)]/10 text-[var(--color-chu-primary)] border border-[var(--color-chu-primary)]/20 rounded-full px-3 py-1 text-xs font-medium">
          Analyse automatique
        </span>
      </div>

        {/* SECTION 1 – Risk Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {Object.entries(riskDistribution).map(([key, data]) => {
            const styleMap = {
              high: { border: 'border-l-4 border-[#D64545]', bg: 'bg-[#2A0A0A]', text: '#D64545', icon: '🔴' },
              moderate: { border: 'border-l-4 border-[#FF8C00]', bg: 'bg-[#2A1A00]', text: '#FF8C00', icon: '🟡' },
              low: { border: 'border-l-4 border-[#00D4AA]', bg: 'bg-[#0A2A20]', text: '#00D4AA', icon: '🟢' },
            }[key];
            return (
              <div key={key} className={`rounded-xl p-4 flex flex-col items-center ${styleMap.border} ${styleMap.bg}`}>
                <div className="flex items-center text-2xl font-bold" style={{ color: styleMap.text }}>
                  <span className="mr-2">{styleMap.icon}</span>{data.label}
                </div>
                <div className="text-[var(--color-chu-text)] mt-2">
                  {data.count} patients ({data.percent})
                </div>
              </div>
            );
          })}
        </div>

      {/* SECTION 2 – Top 5 High‑Risk Patients */}
      <div className="mb-4">
        <h4 className="text-xs uppercase text-[#00D4AA] mb-2">Top 5 patients à risque élevé</h4>
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-chu-card)] text-[var(--color-chu-text-sec)]/50 text-xs uppercase">
            <tr>
              <th className="px-2 py-1 text-left">ID</th>
              <th className="px-2 py-1 text-left">Âge</th>
              <th className="px-2 py-1 text-left">Séjour</th>
              <th className="px-2 py-1 text-left">Risque %</th>
              <th className="px-2 py-1 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {topPatients.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? 'bg-[var(--color-chu-card)]' : 'bg-[var(--color-chu-card)]/60'}>
                <td className="px-2 py-1 text-[var(--color-chu-text)]">{p.id}</td>
                <td className="px-2 py-1 text-[var(--color-chu-text)]">{p.age} ans</td>
                <td className="px-2 py-1 text-[var(--color-chu-text)]">{p.stay}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[var(--color-chu-text)] w-12 text-right">{p.risk}%</span>
                    <div className="w-20 h-2 bg-[var(--color-chu-card)]/10 rounded">
                      <div className="h-2 rounded" style={{ width: `${p.risk}%`, backgroundColor: severityColor(p.severity) }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${severityColor(p.severity)}33`, color: severityColor(p.severity), border: `1px solid ${severityColor(p.severity)}80` }}>
                    {p.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 3 – Automated Insight */}
      <div className="bg-[var(--color-chu-card)] border border-[#D64545]/20 rounded-xl p-4 text-sm text-[var(--color-chu-text)]">
        <div className="flex items-center gap-2 mb-2">
          <span>📊</span>
          <span className="text-[var(--color-chu-text-sec)]/80">Le taux de réadmission actuel (<span className="text-[#D64545] font-bold">30.9%</span>) dépasse la cible clinique de <span className="text-[#00D4AA] font-bold">15%</span>.</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💡</span>
          <span className="text-[var(--color-chu-text-sec)]/80">Facteurs principaux: Âge &gt; 70 ans, Séjour &gt; 10j, Diagnostics multiples.</span>
        </div>
      </div>
    </div>
  );
}
