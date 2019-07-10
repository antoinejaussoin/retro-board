import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTranslations from '../../translations';
import useGlobalState from '../../state';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0 0 0',
  },
});

const SummaryModeSwitch = () => {
  const translations = useTranslations();
  const {
    state: { summaryMode },
    toggleSummaryMode,
  } = useGlobalState();
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <FormGroup>
        <FormControlLabel
          label={translations.Header.summaryMode}
          control={
            <Switch
              color="primary"
              checked={summaryMode}
              onChange={toggleSummaryMode}
            />
          }
        />
      </FormGroup>
    </Box>
  );
};

export default SummaryModeSwitch;
