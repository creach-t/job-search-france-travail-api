import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`
        mt-1 block w-full rounded-md shadow-sm sm:text-sm
        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ft-blue focus:ring-ft-blue'}
        ${className}
      `.trim()}
      {...props}
    />
  );
};

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default Input;