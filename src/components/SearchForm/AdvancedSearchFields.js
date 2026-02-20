import React from 'react';
import {
  experienceOptions,
  contractOptions,
  qualificationOptions,
  workingHoursOptions,
} from './options';

const selectClass = "block w-full py-2 pl-3 pr-8 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-ft-blue focus:ring-1 focus:ring-ft-blue/30 focus:bg-white transition-colors appearance-none";
const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

const SelectWrapper = ({ children }) => (
  <div className="relative">
    {children}
    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const AdvancedSearchFields = ({
  experience,
  setExperience,
  contractType,
  setContractType,
  qualification,
  setQualification,
  workingHours,
  setWorkingHours,
  salaryMin,
  setSalaryMin,
}) => {
  return (
    <div className="pt-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

        <div>
          <label htmlFor="experience" className={labelClass}>Expérience</label>
          <SelectWrapper>
            <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className={selectClass}>
              {experienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </SelectWrapper>
        </div>

        <div>
          <label htmlFor="contractType" className={labelClass}>Contrat</label>
          <SelectWrapper>
            <select id="contractType" value={contractType} onChange={(e) => setContractType(e.target.value)} className={selectClass}>
              {contractOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </SelectWrapper>
        </div>

        <div>
          <label htmlFor="qualification" className={labelClass}>Qualification</label>
          <SelectWrapper>
            <select id="qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} className={selectClass}>
              {qualificationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </SelectWrapper>
        </div>

        <div>
          <label htmlFor="workingHours" className={labelClass}>Temps de travail</label>
          <SelectWrapper>
            <select id="workingHours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className={selectClass}>
              {workingHoursOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </SelectWrapper>
        </div>

        <div>
          <label htmlFor="salaryMin" className={labelClass}>Salaire min</label>
          <SelectWrapper>
            <select id="salaryMin" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={selectClass}>
              <option value="">Indifférent</option>
              <option value="18000">1 500 €/mois</option>
              <option value="21600">1 800 €/mois</option>
              <option value="24000">2 000 €/mois</option>
              <option value="27600">2 300 €/mois</option>
              <option value="30000">2 500 €/mois</option>
              <option value="36000">3 000 €/mois</option>
              <option value="42000">3 500 €/mois</option>
              <option value="48000">4 000 €/mois</option>
              <option value="60000">5 000 €/mois</option>
            </select>
          </SelectWrapper>
          {salaryMin && (
            <p className="mt-1 text-xs text-gray-400">Filtrage côté client</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdvancedSearchFields;
