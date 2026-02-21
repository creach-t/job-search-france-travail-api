import { Link } from 'react-router-dom';
import JobTags from './JobTags';
import SaveButton from './SaveButton';
import ApplyButton from './ApplyButton';
import CompanyPopover from '../ui/CompanyPopover';
import { formatSalaryToMonthly } from '../../utils/salaryUtils';
import { useAppContext } from '../../context/AppContext';

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  if (days < 14) return 'il y a 1 sem';
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem`;
  if (days < 60) return 'il y a 1 mois';
  return `il y a ${Math.floor(days / 30)} mois`;
};

const JobCard = ({ job, onRemove }) => {
  const { isJobSaved, saveJob, removeJob } = useAppContext();
  const isSaved = isJobSaved(job.id);

  const handleSaveJob = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) removeJob(job.id);
    else saveJob(job);
  };

  const salary = formatSalaryToMonthly(job.salaire);
  const hasSalary = salary !== 'Salaire non précisé';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Barre de couleur en haut */}
      <div className="h-1 bg-gradient-to-r from-ft-blue to-ft-darkblue shrink-0" />

      <div className="p-5 flex flex-col flex-1">

        {/* En-tête : titre + bouton save/remove */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {job.intitule}
            </h3>

            {/* Entreprise + lieu avec icônes */}
            <div className="mt-2 space-y-0.5">
              {job.entreprise?.nom && (
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium w-full min-w-0">
                  <svg className="h-3 w-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <CompanyPopover
                    entreprise={job.entreprise}
                    trancheEffectif={job.trancheEffectifEtab}
                    className="text-xs text-gray-700 font-medium truncate"
                  />
                </div>
              )}
              {job.lieuTravail?.libelle && (
                <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 truncate w-full">
                  <svg className="h-3 w-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{job.lieuTravail.libelle}</span>
                </p>
              )}
            </div>
          </div>

          {onRemove ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Retirer des favoris"
              title="Retirer des favoris"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <SaveButton isSaved={isSaved} onSave={handleSaveJob} />
          )}
        </div>

        {/* Tags */}
        <JobTags
          typeContrat={job.typeContratLibelle}
          dureeTravail={job.dureeTravailLibelleConverti}
          experience={job.experienceLibelle}
          qualification={job.qualificationLibelle}
        />

        {/* Description */}
        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {job.description || 'Aucune description disponible'}
        </p>

        {/* Bas de carte — toujours ancré en bas */}
        <div className="mt-auto pt-4 space-y-3">

          {/* Salaire + ancienneté */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 border ${
              hasSalary
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}>
              <svg className={`h-3 w-3 shrink-0 ${hasSalary ? 'text-green-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {salary}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
              <svg className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {relativeTime(job.dateCreation)}
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Link
              to={`/job/${job.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Voir le détail
            </Link>
            <ApplyButton job={job} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobCard;
