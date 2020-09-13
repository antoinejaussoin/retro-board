import React from 'react';
import policy from './cookies.md';
import GenericPolicy from './Policy';

const CookiesPolicyPage = () => {
  return <GenericPolicy url={policy} />;
};

export default CookiesPolicyPage;
