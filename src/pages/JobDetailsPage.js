import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetJobById } from '../hooks/useJobs';
import ApplyButton from '../components/JobCard/ApplyButton';
import CompanyPopover from '../components/ui/CompanyPopover';
import { formatSalaryToMonthly } from '../utils/salaryUtils';
import { useAppContext } from '../context/AppContext';

const extractUrl = (text) => {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
};

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

const Tag = ({ text, primary }) => {
  if (!text) return null;
  return primary ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-ft-blue/10 text-ft-blue border border-ft-blue/20">
      {text}
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {text}
    </span>
  );
};

const ExigenceBadge = ({ code }) => {
  if (!code) return null;
  return (
    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded font-medium ${
      code === 'E' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
    }`}>
      {code === 'E' ? 'Exigé' : 'Souhaité'}
    </span>
  );
};

const InfoRow = ({ icon, label, children }) => (
  <div className="py-4 border-b border-gray-100 last:border-0 sm:flex sm:gap-4">
    <div className="flex items-center gap-1.5 mb-1.5 sm:mb-0 sm:w-36 sm:shrink-0 sm:items-start sm:pt-0.5">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-gray-500">{label}</span>
    </div>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-semibold text-gray-900 mb-3">{children}</h2>
);

const SubLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{children}</p>
);

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useGetJobById(id);
  const { isJobSaved, saveJob, removeJob } = useAppContext();
  const isSaved = isJobSaved(id);

  useEffect(() => {
    if (isError && isJobSaved(id)) {
      removeJob(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, id]);

  const handleSaveJob = () => {
    if (!job) return;
    if (isSaved) removeJob(job.id);
    else saveJob(job);
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <div className="py-20">
          <svg className="animate-spin h-10 w-10 text-ft-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-500">Chargement de l'offre…</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-sm text-red-700">
          Cette offre n'existe pas ou n'est plus disponible.
        </div>
        <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la recherche
        </button>
      </div>
    );
  }

  const salary = formatSalaryToMonthly(job.salaire);
  const hasSalary = salary !== 'Salaire non précisé';
  const hasGeolocation = job.lieuTravail?.latitude && job.lieuTravail?.longitude;

  const courrielUrl = extractUrl(job.contact?.courriel);
  const hasContactBlock = job.contact && (
    job.contact.nom ||
    job.contact.telephone ||
    (job.contact.courriel && !courrielUrl) ||
    job.contact.commentaire
  );

  const hasCompetences = job.competences?.length > 0;
  const hasFormations = job.formations?.length > 0;
  const hasQualites = job.qualitesProfessionnelles?.length > 0;
  const hasLangues = job.langues?.length > 0;
  const hasPermis = job.permis?.length > 0;
  const hasProfileSection = hasCompetences || hasFormations || hasQualites || hasLangues || hasPermis || job.experienceCommentaire || job.outilsBureautiques;
  // La section détaillée reste utile pour la description longue + lien site en pleine largeur
  const hasEmployeurSection = job.entreprise?.description || job.entreprise?.url;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      <button
        onClick={handleBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux résultats
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="h-1 bg-gradient-to-r from-ft-blue to-ft-darkblue" />

        {/* En-tête */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{job.intitule}</h1>

              <div className="mt-2 space-y-1">
                {job.entreprise?.nom && (
                  <div className="inline-flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <CompanyPopover
                      entreprise={job.entreprise}
                      trancheEffectif={job.trancheEffectifEtab}
                      className="text-sm text-gray-700 font-medium"
                    />
                  </div>
                )}
                {job.lieuTravail?.libelle && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.lieuTravail.libelle}
                    {job.lieuTravail.codePostal && ` (${job.lieuTravail.codePostal})`}
                    {hasGeolocation && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${job.lieuTravail.latitude},${job.lieuTravail.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-ft-blue hover:underline text-xs"
                      >
                        Voir sur la carte
                      </a>
                    )}
                  </p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag text={job.typeContratLibelle} primary />
                <Tag text={job.dureeTravailLibelleConverti} />
                <Tag text={job.experienceLibelle} />
                <Tag text={job.qualificationLibelle} />
                {job.alternance && <Tag text="Alternance" />}
                {job.accessibleTH && <Tag text="Accessible TH" />}
                {job.employeurHandiEngage && <Tag text="Handi-engagé" />}
                {(job.entrepriseAdaptee || job.entreprise?.entrepriseAdaptee) && <Tag text="Entreprise adaptée" />}
                {job.offresManqueCandidats && <Tag text="Offre en tension" />}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleSaveJob}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSaved
                    ? 'bg-ft-blue/10 text-ft-blue border-ft-blue/20 hover:bg-ft-blue/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isSaved ? 'Sauvegardée' : 'Sauvegarder'}
              </button>
              <ApplyButton job={job} isDetailed={true} />
            </div>
          </div>
        </div>

        {/* Infos clés */}
        <div className="px-4 sm:px-6 pb-2 border-t border-gray-100">
          <InfoRow
            label="Salaire"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <span className={`font-medium ${hasSalary ? 'text-green-700' : 'text-gray-400'}`}>
              {salary}
            </span>
            {job.salaire?.libelle && hasSalary && (
              <p className="mt-0.5 text-xs text-gray-400">{job.salaire.libelle}</p>
            )}
            {job.salaire?.commentaire && (
              <p className="mt-0.5 text-xs text-gray-500 italic">{job.salaire.commentaire}</p>
            )}
            {(job.salaire?.complement1 || job.salaire?.complement2) && (
              <ul className="mt-1 space-y-0.5 text-xs text-gray-500 list-disc list-inside">
                {job.salaire.complement1 && <li>{job.salaire.complement1}</li>}
                {job.salaire.complement2 && <li>{job.salaire.complement2}</li>}
              </ul>
            )}
          </InfoRow>

          <InfoRow
            label="Contrat"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            {job.typeContratLibelle || 'Non spécifié'}
            {job.natureContrat && <span className="text-gray-400"> · {job.natureContrat}</span>}
          </InfoRow>

          <InfoRow
            label="Durée"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div>{job.dureeTravailLibelle || 'Non spécifiée'}</div>
            <div className="mt-1 text-xs text-gray-400">
              Publiée {relativeTime(job.dateCreation)}
              {job.dateActualisation && job.dateActualisation !== job.dateCreation && (
                <> · mise à jour {relativeTime(job.dateActualisation)}</>
              )}
            </div>
          </InfoRow>

          {job.nombrePostes > 1 && (
            <InfoRow
              label="Postes"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              {job.nombrePostes} postes à pourvoir
            </InfoRow>
          )}

          {job.deplacementLibelle && (
            <InfoRow
              label="Déplacements"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              }
            >
              {job.deplacementLibelle}
            </InfoRow>
          )}

          {job.secteurActiviteLibelle && (
            <InfoRow
              label="Secteur"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              {job.secteurActiviteLibelle}
            </InfoRow>
          )}

          {(job.conditionExercice || job.complementExercice || job.contexteTravail?.horaires || job.contexteTravail?.conditionsExercice) && (
            <InfoRow
              label="Conditions"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              <ul className="space-y-0.5">
                {job.contexteTravail?.horaires && <li>{job.contexteTravail.horaires}</li>}
                {job.conditionExercice && <li>{job.conditionExercice}</li>}
                {job.contexteTravail?.conditionsExercice && job.contexteTravail.conditionsExercice !== job.conditionExercice && (
                  <li>{job.contexteTravail.conditionsExercice}</li>
                )}
                {job.complementExercice && <li className="text-gray-500">{job.complementExercice}</li>}
              </ul>
            </InfoRow>
          )}
        </div>

        {/* Description */}
        <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
          <SectionTitle>Description du poste</SectionTitle>
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') || 'Aucune description disponible' }}
          />
        </div>

        {/* Profil souhaité */}
        {hasProfileSection && (
          <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
            <SectionTitle>Profil souhaité</SectionTitle>
            <div className="space-y-5">

              {job.experienceCommentaire && (
                <div>
                  <SubLabel>Expérience</SubLabel>
                  <p className="text-sm text-gray-700">{job.experienceCommentaire}</p>
                </div>
              )}

              {hasFormations && (
                <div>
                  <SubLabel>Formations</SubLabel>
                  <ul className="space-y-2">
                    {job.formations.map((f, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-medium">{f.niveauLibelle || f.domaineLibelle || 'Formation'}</span>
                          {f.domaineLibelle && f.niveauLibelle && (
                            <span className="text-gray-400">— {f.domaineLibelle}</span>
                          )}
                          <ExigenceBadge code={f.exigence} />
                        </div>
                        {f.commentaire && (
                          <p className="mt-0.5 text-xs text-gray-500">{f.commentaire}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasCompetences && (
                <div>
                  <SubLabel>Compétences</SubLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {job.competences.map((c, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          c.exigence === 'E'
                            ? 'bg-ft-blue/10 text-ft-blue border-ft-blue/20'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {c.libelle}
                        {c.exigence === 'E' && (
                          <span className="opacity-60">· Exigé</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasQualites && (
                <div>
                  <SubLabel>Qualités professionnelles</SubLabel>
                  <div className="space-y-2">
                    {job.qualitesProfessionnelles.map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-3.5 w-3.5 text-ft-blue/50 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{q.libelle}</span>
                          {q.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{q.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {job.outilsBureautiques && (
                <div>
                  <SubLabel>Outils bureautiques</SubLabel>
                  <p className="text-sm text-gray-700">{job.outilsBureautiques}</p>
                </div>
              )}

              {(hasLangues || hasPermis) && (
                <div className="flex flex-wrap gap-8">
                  {hasLangues && (
                    <div>
                      <SubLabel>Langues</SubLabel>
                      <ul className="space-y-1">
                        {job.langues.map((l, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-700">
                            {l.libelle}
                            <ExigenceBadge code={l.exigence} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hasPermis && (
                    <div>
                      <SubLabel>Permis</SubLabel>
                      <ul className="space-y-1">
                        {job.permis.map((p, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-700">
                            {p.libelle}
                            <ExigenceBadge code={p.exigence} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* À propos de l'employeur — section étendue si description longue ou lien site */}
        {hasEmployeurSection && (
          <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
            <SectionTitle>À propos de l'employeur</SectionTitle>
            <div className="space-y-3">
              {job.entreprise.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{job.entreprise.description}</p>
              )}
              {job.entreprise.url && (
                <a
                  href={job.entreprise.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-ft-blue hover:underline"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Site de l'entreprise
                </a>
              )}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        {hasContactBlock && (
          <div className="px-4 sm:px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <SectionTitle>Informations de contact</SectionTitle>
            <div className="space-y-2">
              {job.contact.nom && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {job.contact.nom}
                </div>
              )}
              {job.contact.telephone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${job.contact.telephone}`} className="text-ft-blue hover:underline">
                    {job.contact.telephone}
                  </a>
                </div>
              )}
              {job.contact.courriel && !courrielUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${job.contact.courriel}`} className="text-ft-blue hover:underline">
                    {job.contact.courriel}
                  </a>
                </div>
              )}
              {job.contact.commentaire && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                  {job.contact.commentaire.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                    part.match(/^https?:\/\//) ? (
                      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-ft-blue hover:underline break-all">{part}</a>
                    ) : part
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;
