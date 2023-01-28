import { useState, useEffect, useCallback } from 'react';
import { SessionOptions } from 'common';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import useToggle from '../../hooks/useToggle';
import { ColumnSettings } from '../../state/types';
import TemplateSection from './sections/template/TemplateSection';
import PostsSection from './sections/posts/PostsSection';
import VotingSection from './sections/votes/VotingSection';
import { extrapolate, hasChanged } from '../../state/columns';
import TimerSection from './sections/timer/TimerSection';

interface SessionEditorProps {
  open: boolean;
  options: SessionOptions;
  columns: ColumnSettings[];
  edit?: boolean;
  onChange: (
    options: SessionOptions,
    columns: ColumnSettings[],
    makeDefault: boolean
  ) => void;
  onClose: () => void;
}

function SessionEditor({
  open,
  options: incomingOptions,
  columns,
  edit = false,
  onChange,
  onClose,
}: SessionEditorProps) {
  const { t } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [isDefaultTemplate, toggleIsDefaultTemplate] = useToggle(false);
  const [definitions, setDefinitions] = useState<ColumnSettings[]>(columns);
  const [options, setOptions] = useState(incomingOptions);
  const [currentTab, setCurrentTab] = useState('template');

  useEffect(() => {
    const extrapolatedColumns = columns.map((c) => extrapolate(c, t));
    setDefinitions(extrapolatedColumns);
  }, [columns, t]);

  useEffect(() => {
    setOptions(incomingOptions);
  }, [incomingOptions]);

  const handleCreate = useCallback(() => {
    const definitionsToPersist = hasChanged(columns, definitions, t)
      ? definitions
      : columns;
    onChange(options, definitionsToPersist, isDefaultTemplate);
  }, [onChange, options, definitions, isDefaultTemplate, columns, t]);

  const handleTab = useCallback((_: React.ChangeEvent<{}>, value: string) => {
    setCurrentTab(value);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      keepMounted={false}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={currentTab}
          onChange={handleTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
        >
          <Tab label={t('Customize.template')} value="template" />
          <Tab label={t('Customize.postCategory')} value="posts" />
          <Tab label={t('Customize.votingCategory')} value="voting" />
          <Tab label={t('Customize.timerCategory')} value="timer" />
        </Tabs>
      </AppBar>
      <DialogContent>
        {currentTab === 'template' ? (
          <TemplateSection columns={definitions} onChange={setDefinitions} />
        ) : null}
        {currentTab === 'posts' ? (
          <PostsSection options={options} onChange={setOptions} />
        ) : null}
        {currentTab === 'voting' ? (
          <VotingSection options={options} onChange={setOptions} />
        ) : null}
        {currentTab === 'timer' ? (
          <TimerSection options={options} onChange={setOptions} />
        ) : null}
      </DialogContent>
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={isDefaultTemplate}
              onChange={toggleIsDefaultTemplate}
            />
          }
          label={t('Customize.makeDefaultTemplate')!}
        />
        <Button onClick={onClose} variant="text">
          {t('Generic.cancel')}
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained">
          {edit ? t('Customize.editButton') : t('Customize.startButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionEditor;
