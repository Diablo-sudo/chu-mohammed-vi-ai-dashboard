import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ReadmissionAutoCardProps {
  t: Record<string, string>;
}

export default function ReadmissionAutoCard({ t }: ReadmissionAutoCardProps) {
  return (
    <div className="bg-[var(--color-chu-card)]/80 backdrop-blur rounded-2xl border border-[var(--color-chu-border)]/10 shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[var(--color-chu-text)] font-bold text-lg flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[var(--color-chu-primary)] mr-2" /> {t.readmitRisk}
        </h3>
        <span className="bg-[var(--color-chu-primary)]/10 text-[var(--color-chu-primary)] border border-[var(--color-chu-primary)]/20 rounded-full px-3 py-1 text-xs font-medium">
          {t.automaticAnalysis}
        </span>
      </div>

      <div className="text-sm text-[var(--color-chu-text-sec)] italic">
        {t.noData}
      </div>
    </div>
  );
}