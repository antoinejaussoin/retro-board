import { AutoAwesome } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { requestConfig } from 'api/fetch';
import type { AiSummaryResponse } from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import useUser from 'state/user/useUser';
import useSession from '../useSession';

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
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const visible =
    ai &&
    !!session &&
    !session.encrypted &&
    !!user &&
    user.accountType !== 'anonymous';

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
        setSummary(body.summary);
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

  if (!visible) {
    return null;
  }

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
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          {t('SummaryBoard.aiSummaryHelp')}
        </Typography>
        {error ? (
          <Alert severity="warning" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        ) : null}
        {summary ? <ReactMarkdown>{summary}</ReactMarkdown> : null}
        <Button
          variant="contained"
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />
          }
          disabled={loading}
          onClick={summarise}
        >
          {loading ? t('SummaryBoard.summarising') : t('SummaryBoard.summarise')}
        </Button>
      </CardContent>
    </Card>
  );
}
