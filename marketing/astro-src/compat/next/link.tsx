import React from 'react';
import { useRouter } from './router';

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export default function Link({ href, children, ...props }: LinkProps) {
  const router = useRouter();

  const localizedHref =
    href.startsWith('/') &&
    !href.startsWith('//') &&
    router.locale !== router.defaultLocale
      ? `/${router.locale}${href === '/' ? '' : href}`
      : href;

  return (
    <a href={localizedHref} {...props}>
      {children}
    </a>
  );
}