import React from 'react';
import PropTypes from 'prop-types';
import { BookmarkPlus, Send } from 'lucide-react';

const JobActions = ({ onApply, onSave }) => {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onSave}
        className="flex items-center gap-1 px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
      >
        <BookmarkPlus size={16} />
        <span>Sauvegarder</span>
      </button>
      <button
        onClick={onApply}
        className="flex items-center gap-1 px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        <Send size={16} />
        <span>Postuler</span>
      </button>
    </div>
  );
};

JobActions.propTypes = {
  onApply: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default JobActions;