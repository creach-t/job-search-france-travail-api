import React from 'react';
import PropTypes from 'prop-types';

const variants = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800'
};

const Badge = ({ children, variant = 'info', className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-2.5 py-0.5 text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning']),
  className: PropTypes.string
};

export default Badge;