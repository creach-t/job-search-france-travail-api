import React from 'react';

const SaveButton = ({ isSaved, onSave }) => {
  return (
    <button
      onClick={onSave}
      className="text-gray-400 hover:text-yellow-500 focus:outline-none"
      aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill={isSaved ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isSaved ? "0" : "2"}
        color={isSaved ? "#EAB308" : "currentColor"}
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
