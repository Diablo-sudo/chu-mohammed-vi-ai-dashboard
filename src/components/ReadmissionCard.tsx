import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { RefreshCw } from 'lucide-react';
import type { ReadmitForm } from '../types';

interface ReadmissionCardProps {
  readmitForm: ReadmitForm;
  setReadmitForm: React.Dispatch<React.SetStateAction<ReadmitForm>>;
  readmitResult: { risk?: number; message?: string } | null;
  isPredictingReadmit: boolean;
  handleReadmitPredict: () => void;
  t: Record<string, string>;
}

export default function ReadmissionCard({
  readmitForm,
  setReadmitForm,
  readmitResult,
  isPredictingReadmit,
  handleReadmitPredict,
  t
}: ReadmissionCardProps) {
  return (
    <div className="bg-[var(--color-chu-card)] border border-[var(--color-chu-border)] rounded-2xl p-5">
      <h3 className="text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-4 tracking-wide">{t.readmitRisk}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">{t.age}</label>
          <input type="number" min="0" max="120" value={readmitForm.anchor_age} onChange={e => setReadmitForm(f => ({...f, anchor_age: Number(e.target.value)}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Sexe</label>
          <select value={readmitForm.sex ?? ''} onChange={e => setReadmitForm(f => ({...f, sex: e.target.value as 'M' | 'F'}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="M">{t.male ?? 'Homme'}</option>
            <option value="F">{t.female ?? 'Femme'}</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">{t.primaryDiagnosis ?? 'Diagnostic Principal'}</label>
          <select value={readmitForm.dx_category ?? ''} onChange={e => setReadmitForm(f => ({...f, dx_category: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="circulatory">Circulatory</option>
            <option value="digestive">Digestive</option>
            <option value="injury">Injury</option>
            <option value="musculoskeletal">Musculoskeletal</option>
            <option value="neoplasms">Neoplasms</option>
            <option value="other">Other</option>
            <option value="respiratory">Respiratory</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">{t.losDays ?? 'Durée séjour (jours)'}</label>
          <input type="number" min="0" max="365" value={readmitForm.los ?? ''} onChange={e => setReadmitForm(f => ({...f, los: Number(e.target.value)}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]" />
        </div>
        {/* Row 2 */}
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">{t.admissionType}</label>
          <select value={readmitForm.admission_type ?? ''} onChange={e => setReadmitForm(f => ({...f, admission_type: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="emergency">{t.emergency ?? 'Urgent'}</option>
            <option value="elective">{t.elective ?? 'Electif'}</option>
            <option value="newborn">{t.newborn ?? 'Nouveau-né'}</option>
            <option value="urgent">{t.urgent ?? 'Urgent'}</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Hospitalisation précédente</label>
          <select value={readmitForm.prev_hosp_yn ?? ''} onChange={e => setReadmitForm(f => ({...f, prev_hosp_yn: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="NO">NON</option>
            <option value="YES">OUI</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Jours depuis la dernière sortie</label>
          <input type="number" min="0" max="365" value={readmitForm.days_since_last_discharge ?? ''} onChange={e => setReadmitForm(f => ({...f, days_since_last_discharge: Number(e.target.value)}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]" />
        </div>
        {/* Row 3 */}
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Comorbidités précédentes</label>
          <select value={readmitForm.prev_comorbidity_yn ?? ''} onChange={e => setReadmitForm(f => ({...f, prev_comorbidity_yn: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="NO">NON</option>
            <option value="YES">OUI</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Urgence</label>
          <select value={readmitForm.emergency ?? ''} onChange={e => setReadmitForm(f => ({...f, emergency: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="NO">NON</option>
            <option value="YES">OUI</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Transfert d'urgence</label>
          <select value={readmitForm.emergency_transfer ?? ''} onChange={e => setReadmitForm(f => ({...f, emergency_transfer: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="NO">NON</option>
            <option value="YES">OUI</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[var(--color-chu-text-sec)] uppercase">Service chirurgical</label>
          <select value={readmitForm.surgical_service ?? ''} onChange={e => setReadmitForm(f => ({...f, surgical_service: e.target.value as any}))}
            className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA]">
            <option value="">Non spécifié</option>
            <option value="NO">NON</option>
            <option value="YES">OUI</option>
          </select>
        </div>
      </div>
      <button onClick={handleReadmitPredict} disabled={isPredictingReadmit}
        className="w-full bg-[#00D4AA] hover:bg-[#1DE9B6] text-[#0B1426] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
        {isPredictingReadmit ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {t.evaluateRisk}
      </button>
      {readmitResult && (
        <div className="mt-4 pt-4 border-t border-[var(--color-chu-border)]">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <Doughnut data={{
                datasets: [{
                  data: [readmitResult.risk ? readmitResult.risk * 100 : 0, 100 - (readmitResult.risk ? readmitResult.risk * 100 : 0)],
                  backgroundColor: [readmitResult.risk && readmitResult.risk > 0.5 ? '#D64545' : '#00D4AA', 'rgba(255,255,255,0.1)'],
                  borderWidth: 0
                }]
              }} options={{ responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } } }} />
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {readmitResult.risk ? Math.round(readmitResult.risk * 100) : 0}%
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-md text-sm font-bold ${readmitResult.risk && readmitResult.risk > 0.5 ? 'bg-[#D64545] text-white' : 'bg-[#00D4AA] text-[#0B1426]'}`}>
                {readmitResult.risk && readmitResult.risk > 0.5 ? t.riskHigh : t.riskLow}
              </span>
              {readmitResult.risk && readmitResult.risk > 0.5 && (
                <div className="mt-2 text-xs text-[#E8A020] bg-[#E8A020]/10 px-2 py-1.5 rounded">
                  {t.followupRec}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


