import React, { useState, useEffect, useCallback } from 'react';
import { SessionOptions } from 'retro-board-common';
import {
  Dialog,
  DialogContent,
  useMediaQuery,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Button,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import useTranslations from '../../translations';
import useToggle from '../../hooks/useToggle';
import { ColumnSettings } from '../../state/types';
import TemplateSection from './sections/template/TemplateSection';
import PostsSection from './sections/posts/PostsSection';
import VotingSection from './sections/votes/VotingSection';
import { extrapolate, hasChanged } from '../../state/columns';

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
  const translations = useTranslations();
  const { Customize, Generic } = translations;
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [isDefaultTemplate, toggleIsDefaultTemplate] = useToggle(false);
  const [definitions, setDefinitions] = useState<ColumnSettings[]>(columns);
  const [options, setOptions] = useState(incomingOptions);
  const [currentTab, setCurrentTab] = useState('template');

  useEffect(() => {
    const extrapolatedColumns = columns.map((c) =>
      extrapolate(c, translations)
    );
    setDefinitions(extrapolatedColumns);
  }, [columns, translations]);

  useEffect(() => {
    setOptions(incomingOptions);
  }, [incomingOptions]);

  const handleCreate = useCallback(() => {
    const definitionsToPersist = hasChanged(columns, definitions, translations)
      ? definitions
      : columns;
    onChange(options, definitionsToPersist, isDefaultTemplate);
  }, [
    onChange,
    options,
    definitions,
    isDefaultTemplate,
    columns,
    translations,
  ]);

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
          aria-label="scrollable auto tabs example"
        >
          <Tab label={Customize.template} value="template" />
          <Tab label={Customize.postCategory} value="posts" />
          <Tab label={Customize.votingCategory} value="voting" />
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
      </DialogContent>
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={isDefaultTemplate}
              onChange={toggleIsDefaultTemplate}
            />
          }
          label={Customize.makeDefaultTemplate}
        />
        <Button onClick={onClose} color="default" variant="text">
          {Generic.cancel}
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained">
          {edit ? Customize.editButton : Customize.startButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionEditor;
