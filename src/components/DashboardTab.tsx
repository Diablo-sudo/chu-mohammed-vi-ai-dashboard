import React from 'react';
import { Users, Clock, RefreshCw, HeartPulse, User, Scale } from 'lucide-react';
import KPICard from './KPICard';
import TriageSummaryWidget from './TriageSummaryWidget';
import ReadmissionAutoCard from './ReadmissionAutoCard';

interface DashboardTabProps {
  darkMode: boolean;
  t: Record<string, string>;
  dashboardStats: any;
  showTooltip: (text: string, e: React.MouseEvent) => void;
  hideTooltip: () => void;
  setActiveTab: (tab: string) => void;
}


const DashboardTab: React.FC<DashboardTabProps> = ({
  darkMode,
  t,
  dashboardStats,
  showTooltip,
  hideTooltip,
  setActiveTab,
}) => {

  return (

  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-2">
      <KPICard
        darkMode={darkMode}
        title={t.patientsTotal}
        value={dashboardStats.total_patients.toLocaleString()}
        subtitle={t.patientsSub}
        valueColor="text-[#00713C]"
        borderColor="border-l-[#00713C]"
        icon={Users}
        trend="positive"
        sparklineData={[4200, 4280, 4350, 4420, 4380, 4460, 4506]}
        sparklineColor="#00713C"
        sparklineFill="rgba(0,113,60,0.25)"
        onMouseEnter={(e) => showTooltip("↑ 12% vs mois dernier\nMin: 4000 Max: 5000\nInterprétation: Volume de patients en hausse.", e)}
        onMouseLeave={hideTooltip}
      />
      <KPICard
        darkMode={darkMode}
        title={t.los}
        value={`${(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)}j`}
        subtitle={t.losSub}
        valueColor="text-[#00956E]"
        borderColor="border-l-[#00956E]"
        icon={Clock}
        trend="negative"
        sparklineData={[7.8, 7.6, 7.5, 7.4, 7.5, 7.4, 7.43]}
        sparklineColor="#00956E"
        sparklineFill="rgba(0,149,110,0.25)"
        onMouseEnter={(e) => showTooltip("↓ 0.5j vs mois dernier\nMin: 2j Max: 45j\nInterprétation: Optimisation des lits en cours.", e)}
        onMouseLeave={hideTooltip}
      />
      <KPICard
        darkMode={darkMode}
        title={t.readmission}
        value={`${(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)}%`}
        subtitle={t.readmissionSub}
        valueColor="text-[#E8A020]"
        borderColor="border-l-[#E8A020]"
        icon={RefreshCw}
        trend="positive"
        background={dashboardStats.readmission_rate > 15 ? 'red' : dashboardStats.readmission_rate < 10 ? 'green' : undefined}
        sparklineData={[12.1, 11.8, 11.5, 11.9, 11.3, 11.0, 11.2]}
        sparklineColor="#E8A020"
        sparklineFill="rgba(232,160,32,0.25)"
        onMouseEnter={(e) => showTooltip("↑ 2% vs mois dernier\nMin: 5% Max: 20%\nInterprétation: Attention, taux critique.", e)}
        onMouseLeave={hideTooltip}
      />
      <KPICard
        darkMode={darkMode}
        title={t.mortality}
        value={`${(dashboardStats.mortality_rate ?? 4.2).toFixed(1)}%`}
        subtitle={t.mortalitySub}
        valueColor={dashboardStats.mortality_rate > 5 ? "text-white" : "text-[#D64545]"}
        borderColor="border-l-[#D64545]"
        icon={HeartPulse}
        trend="negative"
        background={dashboardStats.mortality_rate > 5 ? 'red' : undefined}
        sparklineData={[3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6]}
        sparklineColor="#D64545"
        sparklineFill="rgba(214,69,69,0.25)"
        onMouseEnter={(e) => showTooltip("↓ 1% vs mois dernier\nMin: 2j Max: 12%\nInterprétation: Baisse significative.", e)}
        onMouseLeave={hideTooltip}
      />
      <KPICard
        darkMode={darkMode}
        title={t.avgAge}
        value={`${(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans`}
        subtitle={t.ageSub}
        valueColor="text-[#38A8D4]"
        borderColor="border-l-[#38A8D4]"
        icon={User}
        trend="neutral"
        onMouseEnter={(e) => showTooltip("↔ Stable\nMin: 18 Max: 102\nInterprétation: Population vieillissante.", e)}
        onMouseLeave={hideTooltip}
      />
      <KPICard
        darkMode={darkMode}
        title={t.genderStr}
        value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`}
        subtitle={t.genderSub}
        valueColor="text-[#8B5CF6]"
        borderColor="border-l-[#8B5CF6]"
        icon={Scale}
        trend="neutral"
        onMouseEnter={(e) => showTooltip("↔ Stable\nInterprétation: Légère prédominance masculine.", e)}
        onMouseLeave={hideTooltip}
      />
    </div>
    <TriageSummaryWidget t={t} onNavigate={() => setActiveTab('Triage')} />
    <ReadmissionAutoCard t={t} />
  </div>
);

}
export default DashboardTab;
