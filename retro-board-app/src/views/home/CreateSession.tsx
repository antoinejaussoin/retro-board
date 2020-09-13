import React, { useState, useCallback, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import MaxVoteSlider from './components/MaxVoteSlider';
import Slider from './components/Slider';
import BooleanOption from './components/BooleanOption';
import { SessionOptions, ColumnDefinition } from 'retro-board-common';
import OptionItem from './components/OptionItem';
import SettingCategory from './components/SettingCategory';
import ColumnEditor from './components/ColumnEditor';
import TemplatePicker from './components/TemplatePicker';
import { buildDefaults, merge } from '../../state/columns';
import { ColumnSettings, Template } from '../../state/types';
import { getTemplate } from '../../state/templates';
import useTranslations from '../../translations';
import { trackEvent } from './../../track';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import useToggle from '../../hooks/useToggle';

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onLaunch: (
    options: SessionOptions,
    columns: ColumnDefinition[],
    makeDefault: boolean
  ) => void;
}

const CreateSessionModal = ({
  open,
  onClose,
  onLaunch,
}: CreateSessionModalProps) => {
  const translations = useTranslations();
  const { Customize, Generic } = translations;
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [isDefaultTemplate, toggleIsDefaultTemplate] = useToggle(false);
  const [maxUpVotes, setMaxUpVotes] = useState<number | null>(null);
  const [maxDownVotes, setMaxDownVotes] = useState<number | null>(null);
  const [allowActions, setAllowActions] = useState<boolean>(true);
  const [allowSelfVoting, setAllowSelfVoting] = useState<boolean>(false);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState<boolean>(false);
  const [allowAuthorVisible, setAllowAuthorVisible] = useState<boolean>(false);
  const [allowGiphy, setAllowGiphy] = useState<boolean>(true);
  const [allowGrouping, setAllowGrouping] = useState<boolean>(true);
  const [allowReordering, setAllowReordering] = useState<boolean>(true);
  const [numberOfColumns, setNumberOfColumns] = useState<number>(3);
  const [defaultDefinitions, setDefaultDefinitions] = useState(
    buildDefaults('default', translations)
  );
  const [definitions, setDefinitions] = useState<ColumnSettings[]>(
    buildDefaults('default', translations).map(
      (d) =>
        ({ type: d.type, color: '', icon: null, label: '' } as ColumnSettings)
    )
  );
  useEffect(() => {
    setDefaultDefinitions(buildDefaults('default', translations));
  }, [translations]);
  const handleColumnChange = useCallback(
    (value: ColumnSettings, index: number) => {
      setDefinitions((cols) => Object.assign([], cols, { [index]: value }));
      trackEvent('custom-modal/column/change');
    },
    []
  );
  const handleTemplateChange = useCallback(
    (templateType: Template) => {
      const template = buildDefaults(templateType, translations);
      setNumberOfColumns(getTemplate(templateType, translations).length);
      setDefaultDefinitions(template);
      trackEvent('custom-modal/template/select');
    },
    [translations]
  );
  const handleLaunch = useCallback(() => {
    trackEvent('custom-modal/create');
    if (isDefaultTemplate) {
      trackEvent('custom-modal/template/set-defaut');
    }
    onLaunch(
      {
        allowActions,
        allowMultipleVotes,
        allowSelfVoting,
        allowAuthorVisible,
        allowGiphy,
        allowGrouping,
        allowReordering,
        maxDownVotes,
        maxUpVotes,
      },
      merge(definitions, defaultDefinitions, numberOfColumns),
      isDefaultTemplate
    );
  }, [
    onLaunch,
    allowActions,
    allowMultipleVotes,
    allowSelfVoting,
    allowAuthorVisible,
    allowGiphy,
    allowGrouping,
    allowReordering,
    maxDownVotes,
    maxUpVotes,
    definitions,
    defaultDefinitions,
    numberOfColumns,
    isDefaultTemplate,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      keepMounted={false}
    >
      <DialogTitle>{Customize.title}</DialogTitle>
      <DialogContent>
        <SettingCategory
          title={Customize.customTemplateCategory!}
          subtitle={Customize.customTemplateCategorySub!}
        >
          <OptionItem
            label={Customize.template!}
            help={Customize.templateHelp!}
          >
            <TemplatePicker onSelect={handleTemplateChange} />
          </OptionItem>
          <OptionItem
            label={Customize.numberOfColumns!}
            help={Customize.numberOfColumnsHelp!}
          >
            <Slider
              value={numberOfColumns}
              onChange={setNumberOfColumns}
              from={1}
              to={5}
            />
          </OptionItem>
          <>
            {definitions.slice(0, numberOfColumns).map((def, index) => (
              <ColumnEditor
                key={index}
                value={def}
                defaults={defaultDefinitions[index]}
                onChange={(value) => handleColumnChange(value, index)}
              />
            ))}
          </>
        </SettingCategory>
        <SettingCategory
          title={Customize.votingCategory!}
          subtitle={Customize.votingCategorySub!}
        >
          <OptionItem
            label={Customize.maxUpVotes!}
            help={Customize.maxUpVotesHelp!}
          >
            <MaxVoteSlider value={maxUpVotes} onChange={setMaxUpVotes} />
          </OptionItem>
          <OptionItem
            label={Customize.maxDownVotes!}
            help={Customize.maxDownVotesHelp!}
          >
            <MaxVoteSlider value={maxDownVotes} onChange={setMaxDownVotes} />
          </OptionItem>
          <OptionItem
            label={Customize.allowSelfVoting!}
            help={Customize.allowSelfVotingHelp!}
          >
            <BooleanOption
              value={allowSelfVoting}
              onChange={setAllowSelfVoting}
            />
          </OptionItem>
          <OptionItem
            label={Customize.allowMultipleVotes!}
            help={Customize.allowMultipleVotesHelp!}
          >
            <BooleanOption
              value={allowMultipleVotes}
              onChange={setAllowMultipleVotes}
            />
          </OptionItem>
        </SettingCategory>
        <SettingCategory
          title={Customize.postCategory!}
          subtitle={Customize.postCategorySub!}
        >
          <OptionItem
            label={Customize.allowActions!}
            help={Customize.allowActionsHelp!}
          >
            <BooleanOption value={allowActions} onChange={setAllowActions} />
          </OptionItem>
          <OptionItem
            label={Customize.allowAuthorVisible!}
            help={Customize.allowAuthorVisibleHelp!}
          >
            <BooleanOption
              value={allowAuthorVisible}
              onChange={setAllowAuthorVisible}
            />
          </OptionItem>
          <OptionItem
            label={Customize.allowReordering!}
            help={Customize.allowReorderingHelp!}
          >
            <BooleanOption
              value={allowReordering}
              onChange={setAllowReordering}
            />
          </OptionItem>
          <OptionItem
            label={Customize.allowGrouping!}
            help={Customize.allowGroupingHelp!}
          >
            <BooleanOption value={allowGrouping} onChange={setAllowGrouping} />
          </OptionItem>
          <OptionItem
            label={Customize.allowGiphy!}
            help={Customize.allowGiphyHelp!}
          >
            <BooleanOption value={allowGiphy} onChange={setAllowGiphy} />
          </OptionItem>
        </SettingCategory>
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
        <Button onClick={handleLaunch} color="primary" variant="contained">
          {Customize.startButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSessionModal;
