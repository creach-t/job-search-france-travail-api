import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../atoms/Button';

const JobActions = ({ onApply, onSave, isSaved }) => {
  return (
    <div className="mt-6 flex space-x-3">
      <Button
        onClick={onApply}
        variant="primary"
        fullWidth
      >
        Postuler
      </Button>
      <Button
        onClick={onSave}
        variant="outline"
        className="flex-shrink-0"
      >
        {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
      </Button>
    </div>
  );
};

JobActions.propTypes = {
  onApply: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaved: PropTypes.bool
};

export default JobActions;