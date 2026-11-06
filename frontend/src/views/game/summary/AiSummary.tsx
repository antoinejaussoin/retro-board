import { requestConfig } from 'api/fetch';
import type { AiSummaryResponse, StoredAiSummary } from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { Pencil, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import useUser from 'state/user/useUser';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { Spinner } from 'ui/spinner';
import useSession from '../useSession';
import { SummaryMarkdownEditor } from './SummaryMarkdownEditor';

interface AiSummaryProps {
  onSummary: (summary: string) => void;
}

const markdownClass =
  'text-sm leading-6 [&_h1]:mb-2 [&_h1]:text-xl [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:mb-1 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5';

export function AiSummary({ onSummary }: AiSummaryProps) {
  const { session } = useSession();
  const user = useUser();
  const { ai } = useBackendCapabilities();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [known, setKnown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [loadedFor, setLoadedFor] = useState('');
  const [stale, setStale] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const visible =
    ai &&
    !!session &&
    !session.encrypted &&
    !!user &&
    user.accountType !== 'anonymous';
  const sessionId = session?.id ?? '';
  const contentKey = useMemo(() => boardContentKey(session), [session]);
  const shown = loadedFor === sessionId ? summary : '';
  const loadTicket = useRef(0);

  useEffect(() => {
    if (!visible || !sessionId) {
      return;
    }
    const ticket = loadTicket.current + 1;
    loadTicket.current = ticket;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `/api/ai/summary/${encodeURIComponent(sessionId)}`,
          requestConfig(),
        );
        if (cancelled || ticket !== loadTicket.current) {
          return;
        }
        if (response.ok) {
          const body = (await response.json()) as StoredAiSummary;
          const saved = body.summary ?? '';
          setSummary(saved);
          onSummary(saved);
          setStale(Boolean(saved) && body.stale);
        }
        setLoadedFor(sessionId);
      } catch (cause) {
        console.error(cause);
      } finally {
        if (!cancelled && ticket === loadTicket.current) {
          setKnown(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, sessionId, contentKey, onSummary]);

  const summarise = useCallback(async () => {
    if (!session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        body: JSON.stringify({ id: session.id }),
        ...requestConfig(),
      });
      if (response.ok) {
        const body = (await response.json()) as AiSummaryResponse;
        loadTicket.current += 1;
        setSummary(body.summary);
        setLoadedFor(session.id);
        setStale(false);
        setEditing(false);
        onSummary(body.summary);
      } else if (response.status === 402) {
        setError(
          user?.pro ? t('Ai.paidLimitWarning') : t('Ai.freeLimitWarning'),
        );
      } else {
        setError(t('Ai.genericError'));
      }
    } catch (cause) {
      console.error(cause);
      setError(t('Ai.genericError'));
    } finally {
      setLoading(false);
    }
  }, [onSummary, session, t, user]);

  const saveEdit = useCallback(async () => {
    if (!session) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/ai/summary/${encodeURIComponent(session.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ summary: draft }),
          ...requestConfig(),
        },
      );
      if (response.ok) {
        const body = (await response.json()) as AiSummaryResponse;
        loadTicket.current += 1;
        setSummary(body.summary);
        setLoadedFor(session.id);
        setEditing(false);
        onSummary(body.summary);
      } else {
        setError(t('Ai.genericError'));
      }
    } catch (cause) {
      console.error(cause);
      setError(t('Ai.genericError'));
    } finally {
      setSaving(false);
    }
  }, [draft, onSummary, session, t]);

  if (!visible) {
    return null;
  }

  const ready = known && loadedFor === sessionId;
  const canGenerate = ready && !shown;
  const canRegenerate = ready && !!shown && stale;

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-line bg-cream shadow-card">
      <header className="border-b border-line px-5 py-4 text-lg font-light">
        {t('SummaryBoard.aiSummaryTitle')}
      </header>
      <div className="px-5 py-4">
        {!shown ? (
          <p className="mb-4 text-sm text-muted">
            {t('SummaryBoard.aiSummaryHelp')}
          </p>
        ) : null}
        {stale && shown ? (
          <Alert severity="info" className="mb-4">
            {t('SummaryBoard.aiSummaryStale')}
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="warning" className="mb-4">
            {error}
          </Alert>
        ) : null}
        {editing ? (
          <SummaryMarkdownEditor value={draft} onChange={setDraft} />
        ) : shown ? (
          <div className={markdownClass}>
            <ReactMarkdown>{shown}</ReactMarkdown>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                variant="ghost"
                disabled={saving}
                onClick={() => setEditing(false)}
              >
                {t('Generic.cancel')}
              </Button>
              <Button disabled={saving} onClick={saveEdit}>
                {saving ? (
                  <Spinner className="size-4" />
                ) : (
                  t('SummaryBoard.save')
                )}
              </Button>
            </>
          ) : null}
          {(canGenerate || canRegenerate) && !editing ? (
            <Button disabled={loading} onClick={summarise}>
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading
                ? t('SummaryBoard.summarising')
                : canRegenerate
                  ? t('SummaryBoard.regenerate')
                  : t('SummaryBoard.summarise')}
            </Button>
          ) : null}
          {shown && !editing ? (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setDraft(shown);
                setEditing(true);
              }}
            >
              <Pencil className="size-4" />
              {t('SummaryBoard.edit')}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function boardContentKey(
  session: ReturnType<typeof useSession>['session'],
): string {
  if (!session) {
    return '';
  }
  const columns = session.columns
    .map((column) => `${column.index}\t${column.label}`)
    .join('\n');
  const posts = session.posts
    .map(
      (post) =>
        `${post.id}\t${post.content}\t${post.action ?? ''}\t${post.votes.map((vote) => vote.type).join(',')}\t${post.group?.label ?? ''}`,
    )
    .join('\n');
  const groups = session.groups
    .map((group) => `${group.id}\t${group.label}`)
    .join('\n');
  return `${session.name ?? ''}\n${columns}\n${posts}\n${groups}`;
}
