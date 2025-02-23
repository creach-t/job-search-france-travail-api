import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';

const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder,
  maxLength,
  isLoading = false,
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="pr-24"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
          className="h-full rounded-l-none"
        >
          Rechercher
        </Button>
      </div>
    </form>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default SearchInput;