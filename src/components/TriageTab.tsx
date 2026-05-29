import React from 'react';
import TriagePanel from './TriagePanel';
import ReadmissionCard from './ReadmissionCard';

interface TriageTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handlePredict: (e: React.FormEvent) => void;
  isPredicting: boolean;
  predictions: any;
  errorMsg: string;
  setPredictions: React.Dispatch<React.SetStateAction<any>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  t: Record<string, string>;
  handleAgeDec: () => void;
  handleAgeInc: () => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readmitForm: any;
  setReadmitForm: React.Dispatch<React.SetStateAction<any>>;
  readmitResult: any;
  isPredictingReadmit: boolean;
  handleReadmitPredict: () => void;
}

const TriageTab: React.FC<TriageTabProps> = ({
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
  readmitForm,
  setReadmitForm,
  readmitResult,
  isPredictingReadmit,
  handleReadmitPredict,
}) => (
  <div className="flex flex-col gap-6">
    <TriagePanel
      formData={formData}
      setFormData={setFormData}
      handlePredict={handlePredict}
      isPredicting={isPredicting}
      predictions={predictions}
      errorMsg={errorMsg}
      setPredictions={setPredictions}
      setErrorMsg={setErrorMsg}
      t={t}
      handleAgeDec={handleAgeDec}
      handleAgeInc={handleAgeInc}
      handleAgeChange={handleAgeChange}
    />
    <ReadmissionCard
      readmitForm={readmitForm}
      setReadmitForm={setReadmitForm}
      readmitResult={readmitResult}
      isPredictingReadmit={isPredictingReadmit}
      handleReadmitPredict={handleReadmitPredict}
      t={t}
    />
  </div>
);

export default TriageTab;
