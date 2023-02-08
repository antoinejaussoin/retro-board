import React from 'react';
import Text from '../../Text';
import Link from '../../Link';
import Image from '../../Image';
import NextImage from '../../NextImage';

type LogoProps = Partial<HTMLAnchorElement> & {
  logoSrc?: any;
  title: string;
  logoWrapperStyle?: any;
  logoStyle?: any;
  titleStyle?: any;
  withAnchor?: boolean;
  anchorProps?: any;
  width: number;
  height: number;
};

const Logo = ({
  logoWrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    mr: '1rem',
    'a:hover,a:focus': {
      textDecoration: 'none',
    },
  },
  logoStyle,
  titleStyle = {
    display: 'inline-block',
    fontSize: '2rem',
    lineHeight: 'inherit',
    whiteSpace: 'nowrap',
  },
  withAnchor,
  anchorProps,
  logoSrc,
  title,
  width,
  height,
  ...props
}: LogoProps) => (
  <Link {...props} {...logoWrapperStyle} legacyBehavior>
    {withAnchor ? (
      <a {...anchorProps}>
        {logoSrc ? (
          <NextImage
            src={logoSrc.src}
            alt={title}
            width={width}
            height={height}
          />
        ) : (
          <Text content={title} {...titleStyle} />
        )}
      </a>
    ) : (
      <>
        {logoSrc ? (
          <NextImage
            src={logoSrc.src}
            alt={title}
            width={width}
            height={height}
          />
        ) : (
          <Text content={title} {...titleStyle} />
        )}
      </>
    )}
  </Link>
);

export default Logo;
