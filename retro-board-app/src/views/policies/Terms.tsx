import React from 'react';
import policy from './terms.md';
import GenericPolicy from './Policy';

const TermsAndConditionsPage = () => {
  return <GenericPolicy url={policy} />;
};

export default TermsAndConditionsPage;
