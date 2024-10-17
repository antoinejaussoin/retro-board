import { Fragment } from 'react';
import dynamic from 'next/dynamic';

const NoSSR = ({ children }) => children;

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});
