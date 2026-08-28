/**
 * Barre de contrôle de l'analyse — généraliste (tous secteurs).
 * Produit un objet `params` compatible avec useAllJobs / searchJobs, plus un
 * libellé lisible de la requête (pour l'en-tête et les exports).
 */
import React, { useState } from 'react';
import CommuneSearch from '../CommuneSearch';
import MetierAutocomplete from '../SearchForm/MetierAutocomplete';
import { contractOptions, experienceOptions, qualificationOptions } from '../SearchForm/options';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/20/solid';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const selectClass =
  'w-full h-[38px] rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:outline-none focus:border-ft-blue focus:ring-1 focus:ring-ft-blue/30 focus:bg-white transition-colors';

const AnalyseControls = ({ onAnalyze, isFetching }) => {
  const [keywords, setKeywords] = useState('');
  const [commune, setCommune] = useState(null);
  const [distance, setDistance] = useState('30');
  const [metier, setMetier] = useState(null);
  const [contractType, setContractType] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');

  const buildLabel = () => {
    const parts = [];
    if (metier) parts.push(metier.libelle);
    else if (keywords.trim()) parts.push(`"${keywords.trim()}"`);
    else parts.push('Tous métiers');
    if (commune) parts.push(`${commune.nom}${distance === '0' ? '' : ` · ${distance} km`}`);
    const c = contractOptions.find((o) => o.value === contractType);
    if (c && c.value) parts.push(c.label);
    return parts.join(' — ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {
      distance: commune ? distance : undefined,
      contractType: contractType || undefined,
      experience: experience || undefined,
      qualification: qualification || undefined,
    };
    if (metier) params.codeROME = metier.code;
    else if (keywords.trim()) params.keywords = keywords.trim().slice(0, 20);
    if (commune) {
      params.location = commune.code;
      params.locationLabel = commune.nom;
    }
    onAnalyze(params, buildLabel());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Ligne 1 : métier + commune */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Métier (référentiel ROME) — recommandé">
          <MetierAutocomplete selectedMetier={metier} onSelect={setMetier} />
        </Field>
        <Field label="Localisation">
          <CommuneSearch onSelect={setCommune} />
          {commune && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-ft-blue rounded-full text-xs border border-blue-100 font-medium">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{commune.nom}</span>
              {commune.codesPostaux?.[0] && <span className="text-blue-400 font-normal">{commune.codesPostaux[0]}</span>}
              <button type="button" onClick={() => setCommune(null)} className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5">
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </Field>
      </div>

      {/* Rayon (si commune) */}
      {commune && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 shrink-0">Rayon</span>
          <input
            type="range" min="0" max="100" value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="flex-1 accent-ft-blue cursor-pointer"
          />
          <span className="text-xs font-semibold text-ft-blue bg-blue-50 px-2.5 py-1 rounded-full shrink-0 w-20 text-center">
            {distance === '0' ? 'Commune' : `${distance} km`}
          </span>
        </div>
      )}

      {/* Ligne 2 : mots-clés libres (si pas de métier) + filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Field label={metier ? 'Mots-clés (ignorés : métier ROME actif)' : 'Mots-clés libres'}>
          <input
            type="text" value={keywords} maxLength={20} disabled={!!metier}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ex : cariste, aide-soignant…"
            className={`${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </Field>
        <Field label="Type de contrat">
          <select value={contractType} onChange={(e) => setContractType(e.target.value)} className={selectClass}>
            {contractOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Expérience">
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className={selectClass}>
            {experienceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Qualification">
          <select value={qualification} onChange={(e) => setQualification(e.target.value)} className={selectClass}>
            {qualificationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-gray-400">
          Jusqu'à <strong className="text-gray-500">1 150</strong> offres agrégées et recoupées côté client.
        </p>
        <button
          type="submit"
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ft-blue text-white text-sm font-semibold hover:bg-ft-darkblue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isFetching ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          Analyser
        </button>
      </div>
    </form>
  );
};

export default AnalyseControls;
