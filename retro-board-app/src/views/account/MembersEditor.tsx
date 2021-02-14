import { useCallback } from 'react';
import ChipInput from 'material-ui-chip-input';
import useStateFetch from '../../hooks/useStateFetch';
import { updateMembers } from './api';
import { validate } from 'isemail';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../translations';
import { useSnackbar } from 'notistack';

const MAX_MEMBERS = 19;

function isValidEmail(email: string): boolean {
  return validate(email);
}

function doesNotExist(members: string[] | null, email: string): boolean {
  return !members || !members.includes(email);
}

function isNotFull(members: string[] | null): boolean {
  return !members || members.length < MAX_MEMBERS;
}

function MembersEditor() {
  const { AccountPage: translations } = useTranslations();
  const { enqueueSnackbar } = useSnackbar();
  const [members, setMembers] = useStateFetch<string[] | null>(
    '/api/stripe/members',
    null
  );
  const handleAdd = useCallback(
    (value: string) => {
      if (members && !members.includes(value)) {
        setMembers((prev) => {
          const updated = [...(prev || []), value];
          updateMembers(updated);
          return updated;
        });
        enqueueSnackbar(`${value} has been given a pro account.`, {
          variant: 'success',
        });
      }
    },
    [members, setMembers, enqueueSnackbar]
  );
  const handleRemove = useCallback(
    (value: string) => {
      if (members && members.includes(value)) {
        setMembers((prev) => {
          const updated = prev ? prev.filter((v) => v !== value) : null;
          if (updated) {
            updateMembers(updated);
          }
          return updated;
        });
        enqueueSnackbar(`${value} has been removed.`, { variant: 'info' });
      }
    },
    [members, setMembers, enqueueSnackbar]
  );
  const handleBeforeAdd = useCallback(
    (value: string) => {
      return (
        isNotFull(members) &&
        isValidEmail(value) &&
        doesNotExist(members, value)
      );
    },
    [members]
  );

  if (members === null) {
    return null;
  }

  return (
    <Container>
      {!isNotFull(members) ? (
        <Alert severity="warning" style={{ marginBottom: 10 }}>
          {translations.subscription!.membersEditor!.limitReached!(
            MAX_MEMBERS + 1
          )}
        </Alert>
      ) : (
        <Alert severity="info" style={{ marginBottom: 10 }}>
          {translations.subscription!.membersEditor!.info!(MAX_MEMBERS)}
        </Alert>
      )}
      <ChipInput
        placeholder="(enter emails here)"
        value={members}
        onAdd={handleAdd}
        onDelete={handleRemove}
        onBeforeAdd={handleBeforeAdd}
        fullWidth
      />
    </Container>
  );
}
const Container = styled.div`
  margin-top: 20px;
`;

export default MembersEditor;
