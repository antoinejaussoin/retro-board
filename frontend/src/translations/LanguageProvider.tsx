import { useEffect, PropsWithChildren } from 'react';
import useUser from '../auth/useUser';
import { useTranslation } from 'react-i18next';

export default function LanguageProvider({ children }: PropsWithChildren<{}>) {
  const user = useUser();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (user) {
      i18n.changeLanguage(user.language || 'en-GB');
    }
  }, [user, i18n]);

  return <>{children}</>;
}
