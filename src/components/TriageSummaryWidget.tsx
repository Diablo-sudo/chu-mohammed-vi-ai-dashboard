import React, { useEffect, useState } from 'react';
import { Ambulance, Users, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import KPICard from './KPICard';

// No external dependencies; use emojis for icons as specified

interface TriageSummaryWidgetProps {
  t: Record<string, string>;
  onNavigate: () => void;
}

// Mock data as described in the task
const mockTriageToday = {
  total: 47,
  critique: 8,
  enAttente: 12,
  traites: 27,
  derniers: [
    { id: 'P-2847', severity: 'CRITIQUE', time: '3 min' },
    { id: 'P-2846', severity: 'MODÉRÉ', time: '11 min' },
    { id: 'P-2845', severity: 'FAIBLE', time: '18 min' },
    { id: 'P-2844', severity: 'CRITIQUE', time: '25 min' },
    { id: 'P-2843', severity: 'MODÉRÉ', time: '34 min' },
  ],
};

const severityColorMap: Record<string, string> = {
  CRITIQUE: '#D64545', // red
  MODÉRÉ: '#FF8C00',   // orange
  FAIBLE: '#00D4AA',   // green
};

const TriageSummaryWidget: React.FC<TriageSummaryWidgetProps> = ({ t, onNavigate }) => {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setClock(
        new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[var(--color-chu-card)]/80 backdrop-blur rounded-2xl border border-[var(--color-chu-border)]/10 shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ambulance className="w-6 h-6 text-[var(--color-chu-primary)] mr-2" />
          <h3 className="text-[20px] font-bold text-[var(--color-chu-text)]">Triage du Jour</h3>
        </div>
        <span className="bg-[var(--color-chu-primary)]/10 text-[var(--color-chu-primary)] rounded-full px-3 py-1 text-sm">{clock}</span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column – stats mini‑cards */}
        <div className="grid grid-cols-2 gap-4">
          <KPICard
            title="Patients aujourd'hui"
            value={mockTriageToday.total.toString()}
            subtitle=""
            valueColor="text-[#00713C]"
            borderColor="border-l-[#00713C]"
            icon={Users}
          />
          <KPICard
            title="Critique"
            value={mockTriageToday.critique.toString()}
            subtitle=""
            valueColor="text-[#D64545]"
            borderColor="border-l-[#D64545]"
            icon={AlertTriangle}
          />
          <KPICard
            title="En attente"
            value={mockTriageToday.enAttente.toString()}
            subtitle=""
            valueColor="text-[#FF8C00]"
            borderColor="border-l-[#FF8C00]"
            icon={Clock}
          />
          <KPICard
            title="Traités"
            value={mockTriageToday.traites.toString()}
            subtitle=""
            valueColor="text-[#00D4AA]"
            borderColor="border-l-[#00D4AA]"
            icon={CheckCircle}
          />
        </div>

        {/* Right column – latest patients */}
        <div>
          <h4 className="text-sm text-[var(--color-chu-text-sec)] mb-2">Derniers patients</h4>
          {mockTriageToday.derniers.map(p => (
            <div key={p.id} className="rounded-lg bg-[var(--color-chu-card)]/60 px-3 py-2 mb-2 flex items-center justify-between">
              <span className="text-[var(--color-chu-text)]">{p.id}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: severityColorMap[p.severity] ?? '#777' }}
              >
                {p.severity}
              </span>
              <span className="text-xs text-[var(--color-chu-text-sec)]">{p.time}</span>
              <ChevronRight className="w-4 h-4 text-[var(--color-chu-text-sec)]" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4">
        <button
          onClick={onNavigate}
          className="text-[var(--color-chu-primary)] text-sm hover:underline"
        >
          Voir tout dans Triage →
        </button>
      </div>
    </div>
  );
};

export default TriageSummaryWidget;
