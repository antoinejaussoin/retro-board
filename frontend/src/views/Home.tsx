import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, LayoutDashboard } from 'lucide-react';
import type { SessionMetadata } from 'common';
import shortid from 'shortid';
import { useTranslation } from 'react-i18next';
import ClosableAlert from 'components/ClosableAlert';
import { Page } from '../components/Page';
import ProButton from '../components/ProButton';
import SplitButton from 'components/SplitButton/SplitButton';
import useIsPro from '../auth/useIsPro';
import { NameEditor } from 'molecules/NameEditor';
import { trackAdWordsConversion, trackEvent } from './../track';
import { createEncryptedGame, createGame, deleteSession } from '../api';
import { storeEncryptionKeyLocally } from '../crypto/crypto';
import usePreviousSessions from '../hooks/usePreviousSessions';
import useUser from '../state/user/useUser';
import { Alert } from 'ui/alert';
import { MenuItem } from 'ui/menu';
import { useSnackbar } from 'ui/toast';
import SearchBar from './game/SearchBar';
import PreviousGames from './home/PreviousGames';
import { SetupProPrompt } from './home/SetupProPrompt';
import TrialPrompt from './home/TrialPrompt';

function Home() {
  const navigate = useNavigate();
  const user = useUser();
  const isPro = useIsPro();
  const isLoggedIn = !!user;
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const encryptedTriggerRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState('');
  const [previousSessions, refreshPreviousSessions] = usePreviousSessions();
  const hasPreviousSessions = previousSessions.length > 0;

  const filteredSessions = useMemo(() => {
    if (!search) {
      return previousSessions;
    }
    return previousSessions.filter((session) =>
      (session.name || t('SessionName.defaultSessionName'))
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, previousSessions, t]);

  const createDefaultSession = useCallback(async () => {
    const session = await createGame();
    if (session) {
      trackEvent('home/create/default');
      trackAdWordsConversion();
      await refreshPreviousSessions();
      navigate(`/game/${session.id}`);
    } else {
      enqueueSnackbar('Something went wrong when creating the session', {
        variant: 'error',
      });
    }
  }, [navigate, enqueueSnackbar, refreshPreviousSessions]);

  const createEncryptedSession = useCallback(async () => {
    const key = shortid();
    const session = await createEncryptedGame(key);
    if (session) {
      storeEncryptionKeyLocally(session.id, key);
      trackEvent('home/create/encrypted');
      trackAdWordsConversion();
      await refreshPreviousSessions();
      navigate(`/game/${session.id}#${key}`);
    } else {
      enqueueSnackbar(
        'Something went wrong when creating the encrypted session',
        { variant: 'error' },
      );
    }
  }, [navigate, enqueueSnackbar, refreshPreviousSessions]);

  const handleEncryptedSession = useCallback(() => {
    if (isPro) {
      void createEncryptedSession();
      return;
    }
    encryptedTriggerRef.current?.click();
  }, [createEncryptedSession, isPro]);

  const handleDeleteSession = useCallback(
    async (session: SessionMetadata) => {
      await deleteSession(session.id);
      await refreshPreviousSessions();
    },
    [refreshPreviousSessions],
  );

  return (
    <>
      <TrialPrompt />
      <SetupProPrompt />
      {user && user.accountType === 'anonymous' ? (
        <ClosableAlert severity="info" closable>
          <span>{t('Home.anonWarning')}</span>&nbsp;&nbsp;&nbsp;
          <Link className="font-medium no-underline" to="/account">
            {t('Home.login')}
          </Link>
        </ClosableAlert>
      ) : null}
      <Page>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex flex-wrap items-center gap-x-3 text-4xl font-light tracking-tight text-ink sm:text-5xl">
            <span>{t('Home.welcome')}</span>
            <NameEditor />
          </h1>
          <ProButton quota>
            <SplitButton
              data-cy="new-session-button"
              disabled={!isLoggedIn}
              icon={<LayoutDashboard className="size-5" />}
              onClick={createDefaultSession}
              label={t('Join.standardTab.button')}
              secondary
              large
            >
              <MenuItem onSelect={() => void createDefaultSession()}>
                <LayoutDashboard className="size-4" />
                {t('Join.standardTab.button')}
              </MenuItem>
              <MenuItem onSelect={handleEncryptedSession}>
                <KeyRound className="size-4" />
                <span className="flex-1">
                  {t('Encryption.createEncryptedSession')}
                </span>
                <span className="text-xs font-medium text-muted">Pro</span>
              </MenuItem>
            </SplitButton>
          </ProButton>
        </div>

        {hasPreviousSessions ? (
          <>
            <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">
                {t('Join.previousTab.header')}
              </h2>
              <div className="w-full sm:w-72">
                <SearchBar value={search} onChange={setSearch} />
              </div>
            </div>

            <PreviousGames
              games={filteredSessions}
              onDelete={handleDeleteSession}
            />

            {!!search && filteredSessions.length === 0 ? (
              <Alert severity="info" className="mt-4">
                {t('Home.searchNoMatch', { search })}
              </Alert>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="mt-14 text-2xl font-light tracking-tight text-ink sm:text-3xl">
              {t('Home.discover')}
            </h2>
            <div className="mt-6 overflow-hidden rounded-3xl shadow-2xl">
              <iframe
                className="aspect-video w-full max-w-3xl border-0"
                src="https://www.youtube.com/embed/SpbAaziAwTY"
                title="Discover Retrospected"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </>
        )}
      </Page>
      {/* The subscribe dialog has to live outside the split menu, which unmounts when it closes. */}
      <ProButton>
        <button
          ref={encryptedTriggerRef}
          type="button"
          tabIndex={-1}
          className="hidden"
        >
          {t('Encryption.createEncryptedSession')}
        </button>
      </ProButton>
    </>
  );
}

export default Home;
