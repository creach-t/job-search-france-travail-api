import React, { useState } from 'react';

// Extrait une URL depuis un texte (utilisé quand le champ courriel contient un lien)
const extractUrl = (text) => {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
};

// Détermine le mode de postulation principal
const resolveApplyMode = (job) => {
  const contact = job?.contact;
  if (!contact) return { mode: 'none' };

  // URL directe dans urlPostulation
  if (contact.urlPostulation) return { mode: 'url', url: contact.urlPostulation };

  // courriel contenant une URL (pattern France Travail)
  if (contact.courriel) {
    const urlInEmail = extractUrl(contact.courriel);
    if (urlInEmail) return { mode: 'url', url: urlInEmail };
    return { mode: 'email', email: contact.courriel };
  }

  // URL dans le commentaire
  if (contact.commentaire) {
    const urlInComment = extractUrl(contact.commentaire);
    if (urlInComment) return { mode: 'url', url: urlInComment };
  }

  // Téléphone uniquement
  if (contact.telephone) return { mode: 'phone', phone: contact.telephone };

  // Mode info : seulement si un nom ou un commentaire textuel est disponible
  if (contact.nom || contact.commentaire) return { mode: 'info' };

  return { mode: 'none' };
};

// Rendu des parties de texte avec liens cliquables
const TextWithLinks = ({ text }) => (
  <span className="whitespace-pre-wrap">
    {text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      part.match(/^https?:\/\//) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-accent hover:underline break-all">{part}</a>
      ) : part
    )}
  </span>
);

const ApplyButton = ({ job, isDetailed = false, fullWidth = false }) => {
  const [showModal, setShowModal] = useState(false);
  const apply = resolveApplyMode(job);

  // --- Bouton compact (carte) ---
  if (!isDetailed) {
    const baseClass = `inline-flex items-center gap-1.5 py-2 px-3 text-sm font-semibold rounded-lg transition${fullWidth ? ' w-full justify-center' : ''}`;
    if (apply.mode === 'url') {
      return (
        <a href={apply.url} target="_blank" rel="noopener noreferrer"
          className={`${baseClass} bg-accent-gradient text-white shadow-glow-violet hover:opacity-90`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Postuler
        </a>
      );
    }
    if (apply.mode === 'email') {
      return (
        <a href={`mailto:${apply.email}?subject=Candidature – ${job.intitule}`}
          className={`${baseClass} glass-card glass-hover text-accent`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Postuler par email
        </a>
      );
    }
    if (apply.mode === 'phone') {
      return (
        <a href={`tel:${apply.phone}`}
          className={`${baseClass} glass-card glass-hover text-ink`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Appeler
        </a>
      );
    }
    if (apply.mode === 'info') {
      return (
        <>
          <button onClick={() => setShowModal(true)}
            className={`${baseClass} glass-card glass-hover text-ink`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Contact
          </button>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-900/60" onClick={() => setShowModal(false)} />
              <div className="relative cmd-panel max-w-md w-full p-6">
                <h3 className="text-base font-semibold text-ink mb-4">Comment postuler</h3>
                <div className="space-y-3">
                  {job.contact?.nom && (
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-ink-faint mt-0.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <span className="text-ink-muted">{job.contact.nom}</span>
                    </div>
                  )}
                  {job.contact?.commentaire && (
                    <div className="mt-2 p-3 bg-[var(--glass-hover)] rounded-lg text-sm text-ink-muted">
                      <TextWithLinks text={job.contact.commentaire} />
                    </div>
                  )}
                </div>
                <button onClick={() => setShowModal(false)}
                  className="mt-6 w-full py-2 glass-card glass-hover text-ink-muted font-medium rounded-lg transition-colors text-sm">
                  Fermer
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // --- Bouton détaillé (page offre) ---
  const modeConfig = {
    url:   { label: 'Postuler en ligne', color: 'bg-accent-gradient text-white shadow-glow-violet hover:opacity-90', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    )},
    email: { label: 'Postuler par email', color: 'glass-card glass-hover text-accent', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )},
    phone: { label: 'Contacter par téléphone', color: 'glass-card glass-hover text-ink', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )},
    info:  { label: 'Voir comment postuler', color: 'glass-card glass-hover text-ink', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    none:  null,
  };

  const cfg = modeConfig[apply.mode];
  if (!cfg) return null;

  const handleClick = () => {
    if (apply.mode === 'url') window.open(apply.url, '_blank');
    else if (apply.mode === 'email') window.location.href = `mailto:${apply.email}?subject=Candidature – ${job.intitule}`;
    else if (apply.mode === 'phone') window.location.href = `tel:${apply.phone}`;
    else setShowModal(true);
  };

  return (
    <>
      <button onClick={handleClick}
        className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-lg transition ${cfg.color}`}>
        {cfg.icon}
        {cfg.label}
      </button>

      {/* Modal info contact */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60" onClick={() => setShowModal(false)} />
          <div className="relative cmd-panel max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-ink mb-4">Comment postuler</h3>

            <div className="space-y-3">
              {job.contact?.nom && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-ink-faint mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <span className="text-ink-muted">{job.contact.nom}</span>
                </div>
              )}
              {job.contact?.telephone && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-ink-faint mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <a href={`tel:${job.contact.telephone}`} className="text-accent hover:underline">{job.contact.telephone}</a>
                </div>
              )}
              {job.contact?.courriel && !extractUrl(job.contact.courriel) && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-ink-faint mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${job.contact.courriel}`} className="text-accent hover:underline">{job.contact.courriel}</a>
                </div>
              )}
              {job.contact?.commentaire && (
                <div className="mt-2 p-3 bg-[var(--glass-hover)] rounded-lg text-sm text-ink-muted">
                  <TextWithLinks text={job.contact.commentaire} />
                </div>
              )}
            </div>

            <button onClick={() => setShowModal(false)}
              className="mt-6 w-full py-2 glass-card glass-hover text-ink-muted font-medium rounded-lg transition-colors text-sm">
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyButton;
