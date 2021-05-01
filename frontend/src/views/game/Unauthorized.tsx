import { AccessErrorType } from '@retrospected/common';
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
        title: translations.Private.sessionLockedTitle!,
        subtitle: translations.Private.sessionLockedDescription!,
      };
    case 'non_pro':
      return {
        title: translations.Private.sessionNonProTitle!,
        subtitle: translations.Private.sessionNonProDescription!,
      };
  }

  return {
    title: 'Unknown Error',
    subtitle:
      'This session is unavailable to you, because of an unknown error.',
  };
}

export default Unauthorized;
