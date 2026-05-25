import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface UploadFiles {
  admissions: File | null;
  patients: File | null;
  diagnoses: File | null;
}

interface UploadModalProps {
  darkMode: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  uploadFiles: UploadFiles;
  setUploadFiles: React.Dispatch<React.SetStateAction<UploadFiles>>;
  isUploading: boolean;
  submitUpload: () => void;
}

export default function UploadModal({
  darkMode,
  setShowUploadModal,
  uploadFiles,
  setUploadFiles,
  isUploading,
  submitUpload
}: UploadModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${!darkMode ? 'bg-white border-gray-200' : 'bg-[#0B1426] border-[#1E3A5F]'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-chu-text)]">⚙️ Mettre à jour les données</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Admissions CSV (admissions.csv)</label>
            <input type="file" accept=".csv" onChange={(e) => setUploadFiles(prev => ({...prev, admissions: e.target.files?.[0] || null}))}
              className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Patients CSV (patients.csv)</label>
            <input type="file" accept=".csv" onChange={(e) => setUploadFiles(prev => ({...prev, patients: e.target.files?.[0] || null}))}
              className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-chu-text-sec)] uppercase mb-1">Diagnoses CSV (diagnoses_icd.csv)</label>
            <input type="file" accept=".csv" onChange={(e) => setUploadFiles(prev => ({...prev, diagnoses: e.target.files?.[0] || null}))}
              className="w-full text-sm text-[var(--color-chu-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00D4AA]/10 file:text-[#00D4AA] hover:file:bg-[#00D4AA]/20" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowUploadModal(false)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${!darkMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#1B2A4A] text-white hover:bg-[#2A3F5F]'}`}>Annuler</button>
          <button onClick={submitUpload} disabled={isUploading || !uploadFiles.admissions || !uploadFiles.patients || !uploadFiles.diagnoses}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-[#00D4AA] hover:bg-[#00B894] transition-colors disabled:opacity-50 flex items-center justify-center shadow-[0_4px_15px_rgba(0,212,170,0.3)]">
            {isUploading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
            ANALYSER
          </button>
        </div>
      </motion.div>
    </div>
  );
}
