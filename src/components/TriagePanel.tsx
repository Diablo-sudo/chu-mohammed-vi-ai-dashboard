import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Users, Activity, Search, ChevronDown, RefreshCw } from 'lucide-react';
import type { FormData, Predictions } from '../types';

interface TriagePanelProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handlePredict: (e: React.FormEvent) => void;
  isPredicting: boolean;
  predictions: Predictions | null;
  errorMsg: string;
  setPredictions: React.Dispatch<React.SetStateAction<Predictions | null>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  t: Record<string, string>;
  handleAgeDec: () => void;
  handleAgeInc: () => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TriagePanel({
  formData,
  setFormData,
  handlePredict,
  isPredicting,
  predictions,
  errorMsg,
  setPredictions,
  setErrorMsg,
  t,
  handleAgeDec,
  handleAgeInc,
  handleAgeChange
}: TriagePanelProps) {
  const [diagSearch, setDiagSearch] = useState('');
  const [showDiagDropdown, setShowDiagDropdown] = useState(false);
  const diagnosesList = ['Septicémie', 'Pneumonie', 'Insuffisance Cardiaque', 'IRC', 'AVC', 'Diabète', 'Hypertension', 'Traumatisme Crânien'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex-1 bg-[#0B1426] border border-[#1E3A5F] rounded-[16px] p-6 relative flex flex-col transition-all duration-400 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* PANEL HEADER */}
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-[16px]" style={{ background: 'linear-gradient(90deg, #00D4AA, #1B6CA8)' }}></div>
      <div className="-mx-6 -mt-6 mb-6 p-6 rounded-t-[14px] border-b border-[#1E3A5F]" style={{ background: 'linear-gradient(135deg, #0B1426 0%, #1B2A4A 100%)' }}>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-[18px] font-bold text-white mb-0 flex items-center">🏥 {t.triageTitle}</h3>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D4AA]"></span>
          </span>
        </div>
        <p className="text-[#00D4AA] text-[11px] font-medium tracking-wide">Système de prédiction IA • MIMIC-IV</p>
      </div>

      <form onSubmit={handlePredict} className="space-y-5 flex-1 flex flex-col">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2"><User size={14} /> {t.patientAge}</label>
          <div className="flex items-center border border-[#00D4AA] rounded-[10px] bg-[#0D1B2E] overflow-hidden focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all">
            <button type="button" onClick={handleAgeDec} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[18px] font-bold border-none cursor-pointer px-3 py-[14px] hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">−</button>
            <input type="number" min="0" max="120" value={formData.age === 0 ? '' : formData.age} onChange={handleAgeChange}
              className="flex-1 bg-transparent border-none text-white text-center text-lg font-semibold py-[14px] focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder-[#4A6080] [appearance:textfield]" placeholder="--" inputMode="numeric" />
            <button type="button" onClick={handleAgeInc} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[18px] font-bold border-none cursor-pointer px-3 py-[14px] hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">+</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2"><Users size={14} /> {t.patientGender}</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFormData({...formData, gender: 'Homme'})}
              className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${formData.gender === 'Homme' ? 'bg-[#00D4AA] text-white border border-transparent' : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'}`}>👨 {t.male}</button>
            <button type="button" onClick={() => setFormData({...formData, gender: 'Femme'})}
              className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${formData.gender === 'Femme' ? 'bg-[#00D4AA] text-white border border-transparent' : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'}`}>👩 {t.female}</button>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2"><Activity size={14} /> {t.primaryDiagnosis}</label>
          <div className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[10px] px-4 py-3.5 text-white focus-within:border-[#00D4AA] focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all flex items-center relative cursor-text text-sm" onClick={() => setShowDiagDropdown(true)}>
            <Search size={16} className="text-[#00D4AA] mr-3 shrink-0" />
            <input type="text" value={showDiagDropdown ? diagSearch : formData.diagnosis}
              onChange={(e) => { setDiagSearch(e.target.value); setShowDiagDropdown(true); }}
              onFocus={() => { setDiagSearch(''); setShowDiagDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDiagDropdown(false), 200)}
              placeholder={t.searchDiag} className="bg-transparent border-none outline-none w-full text-white placeholder-[#4A6080]" />
            <ChevronDown size={16} className="text-[#00D4AA] ml-3 shrink-0" />
          </div>
          {showDiagDropdown && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#0D1B2E] border border-[rgba(0,212,170,0.25)] rounded-[10px] shadow-xl z-20 max-h-48 overflow-y-auto">
              {diagnosesList.filter(d => d.toLowerCase().includes(diagSearch.toLowerCase())).map((diag) => (
                <div key={diag} className="px-[16px] py-[12px] text-sm text-white hover:bg-[#1B2A4A] hover:text-[#00D4AA] cursor-pointer transition-colors"
                  onClick={() => { setFormData({...formData, diagnosis: diag}); setDiagSearch(''); setShowDiagDropdown(false); }}>
                  {diag}
                </div>
              ))}
              {diagnosesList.filter(d => d.toLowerCase().includes(diagSearch.toLowerCase())).length === 0 && (
                <div className="px-[16px] py-[12px] text-sm text-[#4A6080] italic">{t.noResults}</div>
              )}
            </div>
          )}
         </div>

        {/* ── Vital Signs ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.heartrate}</label>
            <div className="flex items-center border border-[#2A3F5F] rounded-[8px] bg-[#0D1B2E] overflow-hidden focus-within:border-[#00D4AA] focus-within:shadow-[0_0_0_2px_rgba(0,212,170,0.15)] transition-all">
              <button type="button" onClick={() => setFormData(p => ({...p, heartrate: Math.max(40, p.heartrate - 1), dbp: Math.max(30, p.heartrate - 41)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">−</button>
              <input type="number" min="40" max="200" value={formData.heartrate} onChange={e => { const v = Number(e.target.value); setFormData(p => ({...p, heartrate: isNaN(v) ? 80 : Math.max(40, Math.min(200, v)), dbp: Math.max(30, v - 40)})); }}
                className="flex-1 bg-transparent border-none text-white text-center text-sm font-semibold py-1.5 focus:outline-none focus:ring-0 placeholder-[#4A6080] [appearance:textfield]" placeholder="bpm" inputMode="numeric" />
              <button type="button" onClick={() => setFormData(p => ({...p, heartrate: Math.min(200, p.heartrate + 1), dbp: Math.max(30, p.heartrate - 39)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">+</button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.sbp}</label>
            <div className="flex items-center border border-[#2A3F5F] rounded-[8px] bg-[#0D1B2E] overflow-hidden focus-within:border-[#00D4AA] focus-within:shadow-[0_0_0_2px_rgba(0,212,170,0.15)] transition-all">
              <button type="button" onClick={() => setFormData(p => ({...p, sbp: Math.max(70, p.sbp - 1), dbp: Math.max(30, (p.sbp - 1) - 40)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">−</button>
              <input type="number" min="70" max="250" value={formData.sbp} onChange={e => { const v = Number(e.target.value); setFormData(p => ({...p, sbp: isNaN(v) ? 120 : Math.max(70, Math.min(250, v)), dbp: Math.max(30, v - 40)})); }}
                className="flex-1 bg-transparent border-none text-white text-center text-sm font-semibold py-1.5 focus:outline-none focus:ring-0 placeholder-[#4A6080] [appearance:textfield]" placeholder="mmHg" inputMode="numeric" />
              <button type="button" onClick={() => setFormData(p => ({...p, sbp: Math.min(250, p.sbp + 1), dbp: Math.max(30, (p.sbp + 1) - 40)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">+</button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.o2sat}</label>
            <input type="number" min="70" max="100" value={formData.o2sat} onChange={e => { const v = Number(e.target.value); setFormData(p => ({...p, o2sat: isNaN(v) ? 98 : Math.max(70, Math.min(100, v))})); }}
              className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA] focus:shadow-[0_0_0_2px_rgba(0,212,170,0.15)] placeholder-[#4A6080] [appearance:textfield]" placeholder="%" inputMode="numeric" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.temperature}</label>
            <input type="number" min="35" max="42" step="0.1" value={formData.temperature} onChange={e => { const v = parseFloat(e.target.value); setFormData(p => ({...p, temperature: isNaN(v) ? 37.0 : Math.max(35, Math.min(42, v))})); }}
              className="w-full bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA] focus:shadow-[0_0_0_2px_rgba(0,212,170,0.15)] placeholder-[#4A6080]" placeholder="°C" inputMode="decimal" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.pain}</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFormData(p => ({...p, pain: Math.max(0, p.pain - 1)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">−</button>
            <input type="number" min="0" max="10" value={formData.pain} onChange={e => { const v = Number(e.target.value); setFormData(p => ({...p, pain: isNaN(v) ? 0 : Math.max(0, Math.min(10, v))})); }}
              className="flex-1 bg-[#0D1B2E] border border-[#2A3F5F] rounded-[8px] text-white text-center text-sm font-semibold py-1.5 px-3 focus:outline-none focus:border-[#00D4AA] focus:shadow-[0_0_0_2px_rgba(0,212,170,0.15)] placeholder-[#4A6080] [appearance:textfield]" placeholder="0-10" inputMode="numeric" />
            <button type="button" onClick={() => setFormData(p => ({...p, pain: Math.min(10, p.pain + 1)}))} className="flex items-center justify-center bg-transparent text-[#00D4AA] text-[14px] font-bold border-none cursor-pointer px-2 py-1.5 hover:text-white hover:bg-[#00D4AA]/10 transition-colors leading-none select-none">+</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-4">
          <button type="submit" disabled={isPredicting}
            className="w-full text-white font-[700] tracking-[1px] py-[14px] rounded-[10px] flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] text-sm disabled:opacity-70 disabled:hover:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #00D4AA, #00B894)' }}>
            {isPredicting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <span className="mr-2 text-lg leading-none">⚡</span>}
            {t.prediction}
          </button>
          <button type="button" onClick={() => { setPredictions(null); setErrorMsg(''); setFormData({ age: 68, gender: 'Homme', diagnosis: 'Insuffisance Cardiaque', heartrate: 80, sbp: 120, o2sat: 98, temperature: 37.0, pain: 3, dbp: 80, resprate: 16 }); }}
            className="w-full bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#FF6B6B] hover:text-[#FF6B6B] font-bold py-[14px] rounded-[10px] flex items-center justify-center transition-colors text-sm">
            <span className="mr-2 text-lg leading-none">🔄</span>{t.reset}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="mt-4 p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg text-xs text-[#D64545]">{errorMsg}</div>
      )}

      {predictions && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-6 bg-[#0D1B2E] border border-[rgba(0,212,170,0.25)] rounded-[12px] p-5 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-[4px] ${predictions.triage === 1 ? 'bg-[#FF4444]' : predictions.triage === 2 ? 'bg-[#FF8C00]' : 'bg-[#00D4AA]'}`} />
          <div className="flex justify-between items-center mb-4 pt-1">
            <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Niveau Triage</span>
            <div className={`px-3 py-1.5 rounded-md text-white text-sm font-bold shadow-sm flex items-center ${
              predictions.triage === 1 ? 'bg-[#FF4444] shadow-[0_0_10px_rgba(255,68,68,0.4)] animate-pulse' :
              predictions.triage === 2 ? 'bg-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.4)]' :
              'bg-[#00D4AA] shadow-[0_0_10px_rgba(0,212,170,0.4)]'}`}>
              {predictions.triage === 1 ? t.p1 : predictions.triage === 2 ? t.p2 : t.p3}
            </div>
          </div>
          <div className="h-px bg-[#1E3A5F] w-full mb-4" />
          <div className="space-y-5">
             <div>
               <div className="flex justify-between items-end mb-2">
                 <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Score de Charge</span>
                 <span className="text-white text-[16px] font-bold">{Math.round((predictions.urgency_score || 0) * 100)}%</span>
               </div>
               <div className="w-full bg-[#1B2A4A] rounded-full h-2 overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((predictions.urgency_score || 0) * 100, 100)}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                   className={`h-full ${(predictions.urgency_score || 0) > 0.7 ? 'bg-[#FF4444]' : (predictions.urgency_score || 0) > 0.4 ? 'bg-[#FF8C00]' : 'bg-[#00D4AA]'}`} />
               </div>
             </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">Durée Estimée</span>
              <span className="text-white text-[16px] font-bold">{predictions.los?.toFixed(1)} <span className="text-sm font-normal text-[#8899AA]">{t.days}</span></span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider mt-1 whitespace-nowrap">Recommandation</span>
              <span className="text-white text-[14px] font-medium text-right leading-snug">
                {(predictions.triage === 1 ? t.p1Desc : predictions.triage === 2 ? t.p2Desc : t.p3Desc)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
