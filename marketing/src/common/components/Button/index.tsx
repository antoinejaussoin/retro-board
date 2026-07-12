import React, { Fragment } from 'react';
import ButtonStyle from './button.style';
import Loader from '../Loader';

const AnyButtonStyle = ButtonStyle as any;

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  loader?: React.ReactNode;
  loaderColor?: string;
  isMaterial?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: 'textButton' | 'outlined' | 'fab' | 'extendedFab';
  colors?:
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'error'
    | 'primaryWithBg'
    | 'secondaryWithBg'
    | 'warningWithBg'
    | 'errorWithBg';
};

const Button = ({
  type = 'button',
  title,
  icon,
  disabled = false,
  iconPosition,
  onClick,
  loader,
  loaderColor,
  isMaterial = false,
  isLoading = false,
  className,
  ...props
}: ButtonProps) => {
  const addAllClasses = ['reusecore__button'];

  if (isLoading) {
    addAllClasses.push('is-loading');
  }

  if (isMaterial) {
    addAllClasses.push('is-material');
  }

  if (className) {
    addAllClasses.push(className);
  }

  const buttonIcon: React.ReactNode = isLoading ? (
    <Fragment>
      {loader ? loader : <Loader loaderColor={loaderColor || '#30C56D'} />}
    </Fragment>
  ) : icon ? (
    <span className="btn-icon">{icon}</span>
  ) : null;

  const position = iconPosition || 'right';

  return (
    <AnyButtonStyle
      type={type}
      className={addAllClasses.join(' ')}
      disabled={disabled}
      icon-position={position}
      onClick={onClick}
      {...props}
    >
      {position === 'left' ? buttonIcon : null}
      {title ? <span className="btn-text">{title}</span> : null}
      {position === 'right' ? buttonIcon : null}
    </AnyButtonStyle>
  );
};

export default Button;
