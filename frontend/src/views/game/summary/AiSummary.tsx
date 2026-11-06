import { AutoAwesome, Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { requestConfig } from 'api/fetch';
import type { AiSummaryResponse, StoredAiSummary } from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import useUser from 'state/user/useUser';
import useSession from '../useSession';
import { SummaryMarkdownEditor } from './SummaryMarkdownEditor';

interface AiSummaryProps {
  onSummary: (summary: string) => void;
}

export function AiSummary({ onSummary }: AiSummaryProps) {
  const { session } = useSession();
  const user = useUser();
  const { ai } = useBackendCapabilities();
  const { t } = useTranslation();
  const theme = useTheme();
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
    <Card sx={{ marginBottom: 2 }}>
      <CardHeader
        title={
          <Typography variant="h6" style={{ fontWeight: 300 }}>
            {t('SummaryBoard.aiSummaryTitle')}
          </Typography>
        }
        style={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      />
      <CardContent>
        {!shown ? (
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            {t('SummaryBoard.aiSummaryHelp')}
          </Typography>
        ) : null}
        {stale && shown ? (
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            {t('SummaryBoard.aiSummaryStale')}
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        ) : null}
        {editing ? (
          <SummaryMarkdownEditor value={draft} onChange={setDraft} />
        ) : shown ? (
          <ReactMarkdown>{shown}</ReactMarkdown>
        ) : null}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 2 }}>
          {editing ? (
            <>
              <Button disabled={saving} onClick={() => setEditing(false)}>
                {t('Generic.cancel')}
              </Button>
              <Button variant="contained" disabled={saving} onClick={saveEdit}>
                {saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  t('SummaryBoard.save')
                )}
              </Button>
            </>
          ) : null}
          {(canGenerate || canRegenerate) && !editing ? (
            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesome />
                )
              }
              disabled={loading}
              onClick={summarise}
            >
              {loading
                ? t('SummaryBoard.summarising')
                : canRegenerate
                  ? t('SummaryBoard.regenerate')
                  : t('SummaryBoard.summarise')}
            </Button>
          ) : null}
          {shown && !editing ? (
            <Button
              startIcon={<Edit />}
              disabled={loading}
              onClick={() => {
                setDraft(shown);
                setEditing(true);
              }}
            >
              {t('SummaryBoard.edit')}
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
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
