import React from 'react';
import policy from './disclaimer.md';
import GenericPolicy from './Policy';

const DisclaimerPage = () => {
  return <GenericPolicy url={policy} />;
};

export default DisclaimerPage;
