import dynamic from 'next/dynamic';
import { Fragment } from 'react';

const NoSSR = ({ children }) => children;

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});
