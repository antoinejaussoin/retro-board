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
        title: 'non pro',
        subtitle: 'explain why you cant accses',
      };
  }

  return {
    title: 'Not sure',
    subtitle: 'not sure either',
  };
}

export default Unauthorized;
