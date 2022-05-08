import { useState, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { AssignmentReturned, SaveAlt } from '@mui/icons-material';
import SvgIcon from '@mui/material/SvgIcon';
import useMarkdown from './useMarkdown';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

const CopySpeedDial = () => {
  const isSupported = !!window.getSelection;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const mdElement = useRef<HTMLDivElement>(null);
  const md = useMarkdown();

  const handleCopyToMarkdown = useCallback(async () => {
    const p = document.createElement('pre');
    p.innerText = md;
    copyToClipboard(p);
    setOpen(false);
    enqueueSnackbar(t('SummaryBoard.copySuccessful'), { variant: 'success' });
  }, [md, t, enqueueSnackbar]);

  const handleCopyRichText = useCallback(() => {
    copyToClipboard(mdElement.current!);
    setOpen(false);
    enqueueSnackbar(t('SummaryBoard.copySuccessful'), { variant: 'success' });
  }, [t, enqueueSnackbar]);

  return isSupported ? (
    <>
      <SpeedDial
        ariaLabel="Copy to Clipboard menu"
        color="secondary"
        FabProps={{ color: 'secondary' }}
        icon={<SaveAlt />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        <SpeedDialAction
          icon={<AssignmentReturned />}
          tooltipTitle={t('SummaryBoard.copyAsRichText')}
          onClick={handleCopyRichText}
        />
        <SpeedDialAction
          icon={<MarkdownIcon />}
          tooltipTitle={t('SummaryBoard.copyAsMarkdown')}
          onClick={handleCopyToMarkdown}
        />
      </SpeedDial>
      <MdContainer>
        <div ref={mdElement}>
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      </MdContainer>
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

const MdContainer = styled.div`
  display: none;
  visibility: hidden;
`;

const MarkdownIcon = () => {
  return (
    <SvgIcon>
      <path d="M22.269 19.385H1.731a1.73 1.73 0 0 1-1.73-1.73V6.345a1.73 1.73 0 0 1 1.73-1.73h20.538a1.73 1.73 0 0 1 1.73 1.73v11.308a1.73 1.73 0 0 1-1.73 1.731zm-16.5-3.462v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.461v7.847zM21.231 12h-2.308V8.077h-2.307V12h-2.308l3.461 4.039z" />
    </SvgIcon>
  );
};

export default CopySpeedDial;
