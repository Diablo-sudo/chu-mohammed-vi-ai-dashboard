import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Users, Activity, Search, ChevronDown, RefreshCw, AlertTriangle, Ambulance } from 'lucide-react';
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
  handleAgeChange,
}: TriagePanelProps) {
  const [diagSearch, setDiagSearch] = useState('');
  const [showDiagDropdown, setShowDiagDropdown] = useState(false);
  const diagnosesList = [
    'Septicémie',
    'Pneumonie',
    'Insuffisance Cardiaque',
    'IRC',
    'AVC',
    'Diabète',
    'Hypertension',
    'Traumatisme Crânien',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0D1B2A]/80 backdrop-blur rounded-2xl border border-white/10 shadow-xl p-6 relative"
    >
      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4 pl-5">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#00D4AA] to-[#007A8A]"></div>
        <h3 className="text-[20px] font-bold text-white flex items-center">
          <Ambulance className="w-5 h-5 mr-2 text-white" /> {t.triageTitle}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column – Form */}
        <div>
          <form onSubmit={handlePredict} className="space-y-5 flex flex-col">
            {/* Age */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                <User size={14} /> {t.patientAge}
              </label>
              <div className="flex items-center bg-[#0A1628] border border-white/10 rounded-xl p-3">
                <button type="button" onClick={handleAgeDec} className="text-[#00D4AA] text-[18px] font-bold mr-2">−</button>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age === 0 ? '' : formData.age}
                  onChange={handleAgeChange}
                  className="flex-1 bg-transparent border-none text-white text-center text-lg font-semibold placeholder-white/30"
                  placeholder="--"
                  inputMode="numeric"
                />
                <button type="button" onClick={handleAgeInc} className="text-[#00D4AA] text-[18px] font-bold ml-2">+</button>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                <Users size={14} /> {t.patientGender}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Homme' })}
                  className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
                    formData.gender === 'Homme'
                      ? 'bg-[#00D4AA] text-white border border-transparent'
                      : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'
                  }`}
                >
                  👨 {t.male}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Femme' })}
                  className={`w-1/2 py-[10px] px-3 rounded-[25px] font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
                    formData.gender === 'Femme'
                      ? 'bg-[#00D4AA] text-white border border-transparent'
                      : 'bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#00D4AA]/50'
                  }`}
                >
                  👩 {t.female}
                </button>
              </div>
            </div>

            {/* Primary Diagnosis */}
            <div className="space-y-2 relative">
              <label className="text-[11px] font-semibold text-[#00D4AA] uppercase tracking-[1.5px] flex items-center gap-2">
                <Activity size={14} /> {t.primaryDiagnosis}
              </label>
              <div
                className="w-full bg-[#0A1628] border border-white/10 rounded-xl p-3 flex items-center cursor-pointer"
                onClick={() => setShowDiagDropdown(true)}
              >
                <Search size={16} className="text-[#00D4AA] mr-3 shrink-0" />
                <input
                  type="text"
                  value={showDiagDropdown ? diagSearch : formData.diagnosis}
                  onChange={e => { setDiagSearch(e.target.value); setShowDiagDropdown(true); }}
                  onFocus={() => { setDiagSearch(''); setShowDiagDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowDiagDropdown(false), 200)}
                  placeholder={t.searchDiag}
                  className="bg-transparent border-none outline-none w-full text-white placeholder-white/30"
                />
                <ChevronDown size={16} className="text-[#00D4AA] ml-3 shrink-0" />
              </div>
              {showDiagDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0A1628] border border-[#00D4AA] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                  {diagnosesList
                    .filter(d => d.toLowerCase().includes(diagSearch.toLowerCase()))
                    .map(diag => (
                      <div
                        key={diag}
                        className="px-4 py-2 text-sm text-white hover:bg-[#1B2A4A] hover:text-[#00D4AA] cursor-pointer transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, diagnosis: diag });
                          setDiagSearch('');
                          setShowDiagDropdown(false);
                        }}
                      >
                        {diag}
                      </div>
                    ))}
                  {diagnosesList.filter(d => d.toLowerCase().includes(diagSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-sm text-[#4A6080] italic">{t.noResults}</div>
                  )}
                </div>
              )}
            </div>

            {/* Vital Signs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Heartrate */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.heartrate}</label>
                <div className="flex items-center bg-[#0A1628] border border-white/10 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, heartrate: Math.max(40, p.heartrate - 1), dbp: Math.max(30, p.heartrate - 41) }))}
                    className="text-[#00D4AA] text-[14px] font-bold mr-2"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={formData.heartrate}
                    onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, heartrate: isNaN(v) ? 80 : Math.max(40, Math.min(200, v)), dbp: Math.max(30, v - 40) })); }}
                    className="flex-1 bg-transparent border-none text-white text-center text-lg font-semibold placeholder-white/30"
                    placeholder="bpm"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, heartrate: Math.min(200, p.heartrate + 1), dbp: Math.max(30, p.heartrate - 39) }))}
                    className="text-[#00D4AA] text-[14px] font-bold ml-2"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* SBP */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.sbp}</label>
                <div className="flex items-center bg-[#0A1628] border border-white/10 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, sbp: Math.max(70, p.sbp - 1), dbp: Math.max(30, p.sbp - 41) }))}
                    className="text-[#00D4AA] text-[14px] font-bold mr-2"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="70"
                    max="250"
                    value={formData.sbp}
                    onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, sbp: isNaN(v) ? 120 : Math.max(70, Math.min(250, v)), dbp: Math.max(30, v - 40) })); }}
                    className="flex-1 bg-transparent border-none text-white text-center text-lg font-semibold placeholder-white/30"
                    placeholder="mmHg"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, sbp: Math.min(250, p.sbp + 1), dbp: Math.max(30, p.sbp - 39) }))}
                    className="text-[#00D4AA] text-[14px] font-bold ml-2"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* O2Sat */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.o2sat}</label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={formData.o2sat}
                  onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, o2sat: isNaN(v) ? 98 : Math.max(70, Math.min(100, v)) })); }}
                  className="w-full bg-[#0A1628] border border-white/10 rounded-xl p-3 text-white text-sm font-semibold placeholder-white/30"
                  placeholder="%"
                  inputMode="numeric"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.temperature}</label>
                <input
                  type="number"
                  min="35"
                  max="42"
                  step="0.1"
                  value={formData.temperature}
                  onChange={e => { const v = parseFloat(e.target.value); setFormData(p => ({ ...p, temperature: isNaN(v) ? 37.0 : Math.max(35, Math.min(42, v)) })); }}
                  className="w-full bg-[#0A1628] border border-white/10 rounded-xl p-3 text-white text-sm font-semibold placeholder-white/30"
                  placeholder="°C"
                  inputMode="decimal"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.resprate ?? 'Resp. Rate'}</label>
                <input
                  type="number"
                  min="8"
                  max="60"
                  value={formData.resprate}
                  onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, resprate: isNaN(v) ? 16 : Math.max(8, Math.min(60, v)) })); }}
                  className="w-full bg-[#0A1628] border border-white/10 rounded-xl p-3 text-white text-sm font-semibold placeholder-white/30"
                  placeholder="bpm"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Pain */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-[1px]">{t.pain}</label>
              <div className="flex items-center bg-[#0A1628] border border-white/10 rounded-xl p-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, pain: Math.max(0, p.pain - 1) }))}
                  className="text-[#00D4AA] text-[14px] font-bold mr-2"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.pain}
                  onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, pain: isNaN(v) ? 0 : Math.max(0, Math.min(10, v)) })); }}
                  className="flex-1 bg-transparent border-none text-white text-center text-sm font-semibold placeholder-white/30"
                  placeholder="0-10"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, pain: Math.min(10, p.pain + 1) }))}
                  className="text-[#00D4AA] text-[14px] font-bold ml-2"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-auto pt-4">
              <button
                type="submit"
                disabled={isPredicting}
                className="w-full text-white font-[700] tracking-[1px] h-12 rounded-xl flex items-center justify-center transition-all bg-gradient-to-r from-[#00D4AA] to-[#0066FF] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isPredicting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <span className="mr-2 text-lg leading-none">⚡</span>}
                {t.prediction}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPredictions(null);
                  setErrorMsg('');
                  setFormData({
                    age: 68,
                    gender: 'Homme',
                    diagnosis: 'Insuffisance Cardiaque',
                    heartrate: 80,
                    sbp: 120,
                    o2sat: 98,
                    temperature: 37.0,
                    pain: 3,
                    dbp: 80,
                    resprate: 16,
                  });
                }}
                className="w-full bg-transparent border border-[#2A3F5F] text-[#8899AA] hover:border-[#FF6B6B] hover:text-[#FF6B6B] font-bold h-12 rounded-xl flex items-center justify-center transition-colors"
              >
                <span className="mr-2 text-lg leading-none">🔄</span>{t.reset}
              </button>
            </div>
          </form>
          {errorMsg && (
            <div className="mt-4 p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg text-xs text-[#D64545]">{errorMsg}</div>
          )}
        </div>

        {/* Right column – Prediction result */}
        <div className="bg-[#0D1B2A]/80 backdrop-blur rounded-2xl border border-white/10 shadow-xl p-4 flex flex-col items-center justify-center">
          {predictions ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="w-full">
              <div className={`absolute top-0 left-0 w-full h-[4px] ${predictions.triage === 1 ? 'bg-[#FF4444]' : predictions.triage === 2 ? 'bg-[#FF8C00]' : 'bg-[#00D4AA]'}`} />
              <div className="flex justify-between items-center mb-4 pt-1">
                <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">{t.triageLevel}</span>
                <div
                  className={`px-3 py-1.5 rounded-md text-white text-sm font-bold shadow-sm flex items-center ${
                    predictions.triage === 1
                      ? 'bg-[#FF4444] shadow-[0_0_10px_rgba(255,68,68,0.4)] animate-pulse'
                      : predictions.triage === 2
                      ? 'bg-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.4)]'
                      : 'bg-[#00D4AA] shadow-[0_0_10px_rgba(0,212,170,0.4)]'
                  }`}
                >
                  {predictions.triage === 1 ? t.p1 : predictions.triage === 2 ? t.p2 : t.p3}
                </div>
              </div>
              <div className="h-px bg-[#1E3A5F] w-full mb-4" />
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">{t.loadScore}</span>
                    <span className="text-white text-[16px] font-bold">
                      {Math.round((predictions.urgency_score || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1B2A4A] rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((predictions.urgency_score || 0) * 100, 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className={`h-full ${
                        (predictions.urgency_score || 0) > 0.7
                          ? 'bg-[#FF4444]'
                          : (predictions.urgency_score || 0) > 0.4
                          ? 'bg-[#FF8C00]'
                          : 'bg-[#00D4AA]'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider">{t.estLos}</span>
                  <span className="text-white text-[16px] font-bold">
                    {predictions.los?.toFixed(1)} <span className="text-sm font-normal text-[#8899AA]">{t.days}</span>
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[#8899AA] text-[11px] uppercase font-bold tracking-wider mt-1 whitespace-nowrap">{t.recommendation}</span>
                  <span className="text-white text-[14px] font-medium text-right leading-snug">
                    {predictions.triage === 1 ? t.p1Desc : predictions.triage === 2 ? t.p2Desc : t.p3Desc}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-white">
              <AlertTriangle className="w-12 h-12 text-[#00D4AA] mb-2" />
              <p>{t.waitingForPrediction}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
