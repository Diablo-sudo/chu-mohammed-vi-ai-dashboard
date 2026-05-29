import React from 'react';
import { Line } from 'react-chartjs-2';

class SparklineBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return (this as any).props.children;
  }
}

export default function KPICard({ title, value, subtitle, valueColor, borderColor, icon: Icon, darkMode, onMouseEnter, onMouseLeave, trend, background, sparklineData, sparklineColor, sparklineFill }: { 
  title: string, value: string, subtitle: string, valueColor: string, borderColor: string, icon: any, darkMode?: boolean, onMouseEnter?: (e: React.MouseEvent) => void, onMouseLeave?: () => void, 
  trend?: 'positive' | 'negative' | 'neutral', background?: 'red' | 'green', sparklineData?: number[], sparklineColor?: string, sparklineFill?: string 
}) {
  const match = value.match(/^([\d., /]+)(.*)$/);
  const numPart = match ? match[1].trim() : value;
  const displayNum = numPart || '—';
  const textPart = match ? match[2].trim() : '';
  const isLight = !darkMode;
  const trendColor = trend === 'positive' ? 'text-[#00D4AA]' : trend === 'negative' ? 'text-[#D64545]' : 'text-[var(--color-chu-text-sec)]';
  const trendIcon = trend === 'positive' ? '▲' : trend === 'negative' ? '▼' : '▬';
  const bgClass = background === 'red' ? 'bg-[#D64545]/10' : background === 'green' ? 'bg-[#00D4AA]/10' : '';
  return (
    <div className={`group bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] ${borderColor} border-l-4 p-4 rounded-xl flex flex-col justify-between h-[150px] transition-all duration-300 relative cursor-default hover:-translate-y-[3px] hover:shadow-xl ${bgClass} ${isLight ? 'hover:bg-[#F8FFFE] hover:border-[var(--color-chu-border)]' : 'hover:bg-[#142642]'}`} style={{ boxShadow: 'var(--card-shadow)' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-[var(--color-chu-text-sec)] uppercase leading-tight">{title}</span>
        {Icon && <Icon className="w-5 h-5 text-[var(--color-chu-text-sec)] opacity-40 absolute top-4 right-4" />}
      </div>
      <div className={`text-[3.2rem] font-bold font-mono tracking-tight mt-auto mb-1 leading-none ${valueColor}`}>
        {displayNum}{textPart && <span className={`text-xl font-sans ml-1 text-[var(--color-chu-text-sec)] inline-block align-baseline font-normal`}>{textPart}</span>}
      </div>
      <div className={`text-[11px] font-medium leading-tight uppercase flex items-center gap-1 ${trendColor}`}>
        {trend && <span className="text-sm">{trendIcon}</span>}{subtitle}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <SparklineBoundary>
        <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden rounded-b-xl">
          <Line data={{
            labels: sparklineData.map((_, i) => i),
            datasets: [{
              data: sparklineData,
              borderColor: sparklineColor || '#00D4AA',
              backgroundColor: sparklineFill || 'rgba(0, 212, 170, 0.25)',
              fill: true,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4
            }]
          }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { line: { borderCapStyle: 'round' } } }} />
        </div>
        </SparklineBoundary>
      )}
    </div>
  );
}
