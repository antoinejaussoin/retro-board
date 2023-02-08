import { Fragment } from 'react';
import dynamic from 'next/dynamic';

const NoSSR = ({ children }) => <Fragment>{children}</Fragment>;

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});
