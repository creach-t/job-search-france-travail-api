import React from 'react';
import PropTypes from 'prop-types';

const FormField = ({
  label,
  children,
  error,
  helpText,
  required = false,
  className = '',
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helpText && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  helpText: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default FormField;