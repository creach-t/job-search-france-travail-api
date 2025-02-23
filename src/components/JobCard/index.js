import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobTags from './JobTags';
import SaveButton from './SaveButton';

const JobCard = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Vérifier si cette offre est déjà sauvegardée
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.some(savedJob => savedJob.id === job.id));
  }, [job.id]);

  const handleSaveJob = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    
    if (isSaved) {
      const updatedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      setIsSaved(false);
    } else {
      savedJobs.push(job);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      setIsSaved(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-ft-darkblue">{job.intitule}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {job.entreprise?.nom || 'Entreprise non spécifiée'} · {job.lieuTravail?.libelle || 'Lieu non spécifié'}
            </p>
          </div>
          <SaveButton isSaved={isSaved} onSave={handleSaveJob} />
        </div>

        <JobTags 
          typeContrat={job.typeContratLibelle}
          dureeTravail={job.dureeTravailLibelleConverti}
          experience={job.experienceLibelle}
        />

        <p className="mt-4 text-sm text-gray-600 line-clamp-3">
          {job.description ? job.description.substring(0, 200) + '...' : 'Aucune description disponible'}
        </p>

        <div className="mt-4 flex justify-between items-center">
          {job.salaire?.libelle ? (
            <span className="text-sm font-medium text-gray-900">{job.salaire.libelle}</span>
          ) : (
            <span className="text-sm font-medium text-gray-500">Salaire non précisé</span>
          )}
          <span className="text-xs text-gray-500">
            Publiée le {new Date(job.dateCreation).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div className="mt-4">
          <Link
            to={`/job/${job.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ft-blue hover:bg-ft-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
          >
            Voir le détail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
