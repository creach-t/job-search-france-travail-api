import React from 'react';

const SaveButton = ({ isSaved, onSave }) => {
  return (
    <button
      onClick={onSave}
      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
        isSaved
          ? 'text-ft-blue bg-blue-50 hover:bg-blue-100'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
      aria-label={isSaved ? "Retirer des favoris" : "Sauvegarder l'offre"}
      title={isSaved ? "Retirer des favoris" : "Sauvegarder l'offre"}
    >
      <svg
        className="h-4 w-4"
        fill={isSaved ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
};

export default SaveButton;
