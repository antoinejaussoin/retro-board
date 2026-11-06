import { ClipboardCopy, FileText } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Button } from 'ui/button';
import { useSnackbar } from 'ui/toast';
import useMarkdown from './useMarkdown';

const CopySpeedDial = ({ summary }: { summary: string }) => {
  const isSupported = !!window.getSelection;
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const mdElement = useRef<HTMLDivElement>(null);
  const md = useMarkdown(summary);

  const handleCopyToMarkdown = useCallback(async () => {
    const p = document.createElement('pre');
    p.innerText = md;
    copyToClipboard(p);
    enqueueSnackbar(t('SummaryBoard.copySuccessful'), { variant: 'success' });
  }, [md, t, enqueueSnackbar]);

  const handleCopyRichText = useCallback(() => {
    copyToClipboard(mdElement.current!);
    enqueueSnackbar(t('SummaryBoard.copySuccessful'), { variant: 'success' });
  }, [t, enqueueSnackbar]);

  return isSupported ? (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyRichText}>
          <ClipboardCopy className="size-4" />
          {t('SummaryBoard.copyAsRichText')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyToMarkdown}>
          <FileText className="size-4" />
          {t('SummaryBoard.copyAsMarkdown')}
        </Button>
      </div>
      <div className="hidden" aria-hidden="true">
        <div ref={mdElement}>
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      </div>
    </>
  ) : null;
};

function copyToClipboard(content: HTMLElement) {
  const container = document.createElement('div');
  container.style.height = '0px';
  container.setAttribute('contenteditable', 'true');
  container.appendChild(content);
  document.body.appendChild(container);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(container);
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
  document.body.removeChild(container);
}

export default CopySpeedDial;
