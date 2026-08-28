import React from 'react';

const Error = ({ message = "Une erreur s'est produite. Veuillez réessayer." }) => {
  return (
    <div className="glass-card border-l-4 border-rose-500 p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-ink">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
