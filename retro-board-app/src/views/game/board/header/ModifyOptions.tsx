import React, { useState, useCallback } from 'react';
import useGlobalState from '../../../../state';
import { Button } from '@material-ui/core';
import SessionEditor from '../../../session-editor/SessionEditor';
import { ColumnSettings } from '../../../../state/types';
import { SessionOptions, ColumnDefinition } from '@retrospected/common';
import { toColumnDefinitions } from '../../../../state/columns';
import { trackEvent } from '../../../../track';
import { Settings } from '@material-ui/icons';
import useTranslations from '../../../../translations';

interface ModifyOptionsProps {
  onEditOptions: (options: SessionOptions) => void;
  onEditColumns: (columns: ColumnDefinition[]) => void;
  onSaveTemplate: (
    options: SessionOptions,
    columns: ColumnDefinition[]
  ) => void;
}

function ModifyOptions({
  onEditOptions,
  onEditColumns,
  onSaveTemplate,
}: ModifyOptionsProps) {
  const { Join } = useTranslations();
  const [open, setOpen] = useState(false);
  const { state } = useGlobalState();

  const handleChange = useCallback(
    (
      updatedOptions: SessionOptions,
      updatedColumns: ColumnSettings[],
      saveAsTemplate: boolean
    ) => {
      setOpen(false);
      if (!state.session) {
        return;
      }
      const { options, columns } = state.session;
      if (options !== updatedOptions) {
        onEditOptions(updatedOptions);
        trackEvent('game/session/edit-options');
      }
      if (columns !== updatedColumns) {
        onEditColumns(toColumnDefinitions(updatedColumns));
        trackEvent('game/session/edit-columns');
      }
      if (saveAsTemplate) {
        console.log('save as template');
        onSaveTemplate(updatedOptions, toColumnDefinitions(updatedColumns));
        trackEvent('custom-modal/template/set-defaut');
      }
    },
    [onEditOptions, onEditColumns, onSaveTemplate, state.session]
  );

  if (!state.session) {
    return null;
  }

  const { options, columns } = state.session;

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Settings />}
        onClick={() => setOpen(true)}
      >
        {Join.standardTab.customizeButton}
      </Button>
      {open ? (
        <SessionEditor
          edit
          open={open}
          columns={columns}
          options={options}
          onClose={() => setOpen(false)}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
}

export default ModifyOptions;
