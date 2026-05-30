import React, { useEffect, useState } from 'react';
import { Ambulance, Users, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import KPICard from './KPICard';

interface TriageSummaryWidgetProps {
  t: Record<string, string>;
  onNavigate: () => void;
}

const severityColorMap: Record<string, string> = {
  CRITIQUE: '#D64545',
  MODÉRÉ: '#FF8C00',
  FAIBLE: '#00D4AA',
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ambulance className="w-6 h-6 text-[var(--color-chu-primary)] mr-2" />
          <h3 className="text-[20px] font-bold text-[var(--color-chu-text)]">{t.triageOfDay}</h3>
        </div>
        <span className="bg-[var(--color-chu-primary)]/10 text-[var(--color-chu-primary)] rounded-full px-3 py-1 text-sm">{clock}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KPICard
            title={t.patientsToday}
            value="0"
            subtitle=""
            valueColor="text-[#00713C]"
            borderColor="border-l-[#00713C]"
            icon={Users}
          />
          <KPICard
            title={t.criticalLabel}
            value="0"
            subtitle=""
            valueColor="text-[#D64545]"
            borderColor="border-l-[#D64545]"
            icon={AlertTriangle}
          />
          <KPICard
            title={t.waitingLabel}
            value="0"
            subtitle=""
            valueColor="text-[#FF8C00]"
            borderColor="border-l-[#FF8C00]"
            icon={Clock}
          />
          <KPICard
            title={t.treatedLabel}
            value="0"
            subtitle=""
            valueColor="text-[#00D4AA]"
            borderColor="border-l-[#00D4AA]"
            icon={CheckCircle}
          />
        </div>

        <div>
          <h4 className="text-sm text-[var(--color-chu-text-sec)] mb-2">{t.latestPatients}</h4>
          <div className="text-sm text-[var(--color-chu-text-sec)] italic">{t.noData}</div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onNavigate}
          className="text-[var(--color-chu-primary)] text-sm hover:underline"
        >
          {t.viewAllInTriage}
        </button>
      </div>
    </div>
  );
};

export default TriageSummaryWidget;