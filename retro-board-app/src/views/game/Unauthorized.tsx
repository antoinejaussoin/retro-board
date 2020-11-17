import React from 'react';
import { AccessErrorType } from 'retro-board-common';
import NoContent from '../../components/NoContent';
import useTranslations from '../../translations';

interface UnauthorizedProps {
  reason?: AccessErrorType;
}

function Unauthorized({ reason }: UnauthorizedProps) {
  const error = useGetErrors(reason);
  return <NoContent title={error.title} subtitle={error.subtitle} />;
}

interface Errors {
  title: string;
  subtitle: string;
}

function useGetErrors(reason?: AccessErrorType): Errors {
  const translations = useTranslations();
  switch (reason) {
    case 'locked':
      return {
        title: translations.Locking.sessionLockedTitle!,
        subtitle: translations.Locking.sessionLockedDescription!,
      };
    case 'non_pro':
      return {
        title: translations.Locking.sessionNonProTitle!,
        subtitle: translations.Locking.sessionNonProDescription!,
      };
  }

  return {
    title: 'Unknown Error',
    subtitle:
      'This session is unavailable to you, because of an unknown error.',
  };
}

export default Unauthorized;
