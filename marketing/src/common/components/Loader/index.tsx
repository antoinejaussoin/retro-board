import React from 'react';
import LoaderStyle from './loader.style';

type LoaderProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  loaderColor?: string;
};

export function Loader({ loaderColor, className, ...props }: LoaderProps) {
  // Add all classs to an array
  const addAllClasses = ['reusecore__loader'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }
  return (
    <LoaderStyle
      className={addAllClasses.join(' ')}
      loaderColor={loaderColor}
      {...props}
    />
  );
}

export default Loader;
