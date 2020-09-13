import React from 'react';
import policy from './privacy.md';
import GenericPolicy from './Policy';

const PrivacyPolicyPage = () => {
  return <GenericPolicy url={policy} />;
};

export default PrivacyPolicyPage;
