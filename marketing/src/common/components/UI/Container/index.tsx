import React from 'react';
import ContainerWrapper from './style';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noGutter?: boolean;
  mobileGutter?: boolean;
  width?: string;
};

const Container = ({
  children,
  className,
  fullWidth,
  noGutter,
  mobileGutter,
  width,
}: ContainerProps) => {
  // Add all classs to an array
  const addAllClasses = ['container'];
  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <ContainerWrapper
      className={addAllClasses.join(' ')}
      fullWidth={fullWidth}
      noGutter={noGutter}
      width={width}
      mobileGutter={mobileGutter}
    >
      {children}
    </ContainerWrapper>
  );
};

export default Container;
