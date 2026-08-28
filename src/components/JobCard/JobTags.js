import React from 'react';

const formatExperience = (exp) => {
  if (!exp) return null;
  if (/débutant/i.test(exp)) return 'Débutant';
  const m = exp.match(/(\d+)\s*[Aa]n/);
  if (m) {
    const n = parseInt(m[1], 10);
    return `${n} an${n > 1 ? 's' : ''} d'exp.`;
  }
  if (/exig/i.test(exp)) return 'Exp. exigée';
  if (/souhait/i.test(exp)) return 'Exp. souhaitée';
  return exp.length > 22 ? exp.slice(0, 20) + '…' : exp;
};

const Tag = ({ text }) => {
  if (!text) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--glass-hover)] text-ink-muted border border-[rgb(var(--line)/0.18)]">
      {text}
    </span>
  );
};

const JobTags = ({ typeContrat, dureeTravail, experience, qualification }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {typeContrat && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent/15 text-accent border border-accent/25">
          {typeContrat}
        </span>
      )}
      {dureeTravail && <Tag text={dureeTravail} />}
      {experience && <Tag text={formatExperience(experience)} />}
      {qualification && <Tag text={qualification} />}
    </div>
  );
};

export default JobTags;
