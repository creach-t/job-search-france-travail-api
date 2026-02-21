import React from 'react';
import {
  experienceOptions,
  contractOptions,
  qualificationOptions,
  workingHoursOptions,
  stackGroups,
} from './options';
import MetierAutocomplete from './MetierAutocomplete';
import { useAppContext } from '../../context/AppContext';

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
  stacks = [],
  onStackToggle,
  selectedMetier,
  onMetierSelect,
}) => {
  const { isDevMode } = useAppContext();

  return (
    <div className="pt-5 space-y-4">

      {/* ── Métier précis (Code ROME) ── */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            Métier précis (Code ROME)
            <span className="normal-case tracking-normal font-normal text-gray-400">— Recherche ultra-ciblée</span>
          </span>
        </label>
        <MetierAutocomplete selectedMetier={selectedMetier} onSelect={onMetierSelect} />
      </div>

      {/* ── Sélecteur multi-stack : DevJobs uniquement ── */}
      {isDevMode && <div>
        <label className={labelClass}>
          Stack / Technologie
          {stacks.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 bg-ft-blue text-white text-xs font-bold px-2 py-0.5 rounded-full normal-case tracking-normal">
              {stacks.length} sélectionné{stacks.length > 1 ? 's' : ''}
            </span>
          )}
        </label>

        <div className="space-y-2">
          {stackGroups.map(({ group, options }) => (
            <div key={group} className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">
                {group}
              </span>
              {options.map(opt => {
                const active = stacks.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStackToggle(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-ft-blue text-white border-ft-blue shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-ft-blue hover:text-ft-blue'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {stacks.length >= 2 && (
          <p className="mt-2 text-xs text-ft-blue flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {stacks.length} recherches parallèles · résultats combinés et dédupliqués
          </p>
        )}
      </div>}

      {/* ── Filtres classiques ── */}
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
