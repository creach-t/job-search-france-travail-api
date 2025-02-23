import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../../atoms/Input';
import Select from '../../../atoms/Select';
import FormField from '../../../molecules/FormField';
import CommuneSearch from '../../../molecules/CommuneSearch';
import { distanceOptions } from '../../../../constants/searchOptions';

const BasicSearch = ({
  keywords,
  onKeywordsChange,
  selectedCommune,
  onCommuneSelect,
  distance,
  onDistanceChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full md:col-span-1 lg:col-span-2">
        <FormField
          label="Mots-clés"
          helpText={keywords.length > 15 ? `${20 - keywords.length} caractères restants` : null}
        >
          <Input
            value={keywords}
            onChange={onKeywordsChange}
            placeholder="Titre, technologie..."
            maxLength={20}
          />
        </FormField>
      </div>

      <div>
        <FormField label="Commune">
          <CommuneSearch onSelect={onCommuneSelect} />
        </FormField>
      </div>

      <div>
        <FormField label="Distance (km)">
          <Select
            value={distance}
            onChange={onDistanceChange}
            options={distanceOptions}
          />
        </FormField>
      </div>
    </div>
  );
};

BasicSearch.propTypes = {
  keywords: PropTypes.string.isRequired,
  onKeywordsChange: PropTypes.func.isRequired,
  selectedCommune: PropTypes.object,
  onCommuneSelect: PropTypes.func.isRequired,
  distance: PropTypes.string.isRequired,
  onDistanceChange: PropTypes.func.isRequired,
};

export default BasicSearch;