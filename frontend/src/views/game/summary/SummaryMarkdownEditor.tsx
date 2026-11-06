import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  Title,
} from '@mui/icons-material';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

interface SummaryMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SummaryMarkdownEditor({
  value,
  onChange,
}: SummaryMarkdownEditorProps) {
  const { t } = useTranslation();
  const input = useRef<HTMLTextAreaElement>(null);

  const apply = (before: string, after: string, fallback: string) => {
    const field = input.current;
    if (!field) {
      onChange(`${value}${before}${fallback}${after}`);
      return;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    const cursor = start + before.length + selected.length + after.length;
    onChange(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 1 }}>
        <IconButton
          size="small"
          aria-label={t('SummaryBoard.bold')}
          onClick={() => apply('**', '**', t('SummaryBoard.bold'))}
        >
          <FormatBold fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={t('SummaryBoard.italic')}
          onClick={() => apply('*', '*', t('SummaryBoard.italic'))}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={t('SummaryBoard.heading')}
          onClick={() => apply('## ', '', t('SummaryBoard.heading'))}
        >
          <Title fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={t('SummaryBoard.list')}
          onClick={() => apply('- ', '', t('SummaryBoard.list'))}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <TextField
          inputRef={input}
          multiline
          minRows={8}
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t('SummaryBoard.edit')}
        />
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            padding: 2,
            overflow: 'auto',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('SummaryBoard.preview')}
          </Typography>
          <ReactMarkdown>{value}</ReactMarkdown>
        </Box>
      </Box>
    </Box>
  );
}
