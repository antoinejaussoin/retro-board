import { useState, useCallback } from 'react';
import clsx from 'clsx';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import ErrorIcon from '@material-ui/icons/Error';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

interface OutdatedBrowserProps {
  show: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 25,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
  },
}));

const OutdatedBrowser = ({ show }: OutdatedBrowserProps) => {
  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => setOpen(false), []);
  const classes = useStyles();
  if (!show) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
    >
      <SnackbarContent
        className={classes.error}
        message={
          <span className={classes.message}>
            <ErrorIcon className={clsx(classes.icon, classes.iconVariant)} />
            Your browser is outdated. Please use a recent version of Chrome,
            Firefox, Safari, Edge or Internet Explorer 11.
            <br />
            Your experience on this app might not be great with the browser you
            are using.
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>,
        ]}
      ></SnackbarContent>
    </Snackbar>
  );
};

export default OutdatedBrowser;
