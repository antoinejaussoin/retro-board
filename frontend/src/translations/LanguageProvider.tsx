import {
  useState,
  useEffect,
  useCallback,
  useContext,
  PropsWithChildren,
} from 'react';
import Context from './Context';
import UserContext from '../auth/Context';
import { TrackingEvent } from 'common';
import { updateLanguage } from '../api';
import { getItem, setItem } from '../utils/localStorage';
import { trackEvent } from '../track';
import useUser from '../auth/useUser';
import config from '../utils/getConfig';

export default function LanguageProvider({ children }: PropsWithChildren<{}>) {
  const [language, setLanguage] = useState(config.defaultLanguage);
  const user = useUser();
  const { setUser } = useContext(UserContext);

  const handleChangeLanguage = useCallback(
    async (language: string) => {
      setLanguage(language);
      setItem('language', language);
      const updatedUser = await updateLanguage(language);
      if (updatedUser) {
        setUser(updatedUser);
      }
    },
    [setUser]
  );

  useEffect(() => {
    const language = getItem('language');
    if (language) {
      trackEvent(`language/change/${language}` as TrackingEvent);
      setLanguage(language);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLanguage(user.language);
    }
  }, [user]);

  return (
    <Context.Provider value={{ language, setLanguage: handleChangeLanguage }}>
      {children}
    </Context.Provider>
  );
}
