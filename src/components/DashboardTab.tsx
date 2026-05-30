import React from 'react';
import { Users, Clock, RefreshCw, HeartPulse, User, Scale } from 'lucide-react';
import KPICard from './KPICard';
import TriageSummaryWidget from './TriageSummaryWidget';
import ReadmissionAutoCard from './ReadmissionAutoCard';

interface DashboardTabProps {
  darkMode: boolean;
  t: Record<string, string>;
  dashboardStats: any;
  setActiveTab: (tab: string) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  darkMode,
  t,
  dashboardStats,
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
      />
      <KPICard
        darkMode={darkMode}
        title={t.los}
        value={`${(isNaN(Number(dashboardStats.avg_los)) ? 0 : Number(dashboardStats.avg_los)).toFixed(2)}j`}
        subtitle={t.losSub}
        valueColor="text-[#00956E]"
        borderColor="border-l-[#00956E]"
        icon={Clock}
      />
      <KPICard
        darkMode={darkMode}
        title={t.readmission}
        value={`${(isNaN(Number(dashboardStats.readmission_rate)) ? 0 : Number(dashboardStats.readmission_rate)).toFixed(1)}%`}
        subtitle={t.readmissionSub}
        valueColor="text-[#E8A020]"
        borderColor="border-l-[#E8A020]"
        icon={RefreshCw}
        background={dashboardStats.readmission_rate > 15 ? 'red' : dashboardStats.readmission_rate < 10 ? 'green' : undefined}
      />
      <KPICard
        darkMode={darkMode}
        title={t.mortality}
        value={`${(isNaN(Number(dashboardStats.mortality_rate)) ? 0 : Number(dashboardStats.mortality_rate)).toFixed(1)}%`}
        subtitle={t.mortalitySub}
        valueColor="text-[#D64545]"
        borderColor="border-l-[#D64545]"
        icon={HeartPulse}
        background={dashboardStats.mortality_rate > 5 ? 'red' : undefined}
      />
      <KPICard
        darkMode={darkMode}
        title={t.avgAge}
        value={`${(isNaN(Number(dashboardStats.avg_age)) ? 0 : Math.round(Number(dashboardStats.avg_age)))} ans`}
        subtitle={t.ageSub}
        valueColor="text-[#38A8D4]"
        borderColor="border-l-[#38A8D4]"
        icon={User}
      />
      <KPICard
        darkMode={darkMode}
        title={t.genderStr}
        value={`${dashboardStats.gender_M} / ${dashboardStats.gender_F}`}
        subtitle={t.genderSub}
        valueColor="text-[#8B5CF6]"
        borderColor="border-l-[#8B5CF6]"
        icon={Scale}
      />
    </div>
    <TriageSummaryWidget t={t} onNavigate={() => setActiveTab('Triage')} />
    <ReadmissionAutoCard t={t} />
  </div>
);

}
export default DashboardTab;