import React from 'react';

export default function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-2xl p-5 flex flex-col h-[300px] transition-colors duration-400" style={{ boxShadow: 'var(--card-shadow)' }}>
      <h3 className="text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-4 tracking-wide">{title}</h3>
      <div className="flex-1 min-h-0 relative">{children}</div>
    </div>
  );
}
