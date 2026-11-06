import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../../state/queryKeys';
import { getMembers, updateMembers } from './api';
import { validate } from 'email/validate';
import styled from '@emotion/styled';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import TagInput from '../../components/TagInput';

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
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data: members = null } = useQuery({
    queryKey: queryKeys.members,
    queryFn: getMembers,
  });
  const handleAdd = useCallback(
    (value: string) => {
      if (members && !members.includes(value)) {
        const updated = [...members, value];
        queryClient.setQueryData(queryKeys.members, updated);
        void updateMembers(updated);
        enqueueSnackbar(`${value} has been given a pro account.`, {
          variant: 'success',
        });
      }
    },
    [members, queryClient, enqueueSnackbar]
  );
  const handleRemove = useCallback(
    (value: string) => {
      if (members && members.includes(value)) {
        const updated = members.filter((member) => member !== value);
        queryClient.setQueryData(queryKeys.members, updated);
        void updateMembers(updated);
        enqueueSnackbar(`${value} has been removed.`, { variant: 'info' });
      }
    },
    [members, queryClient, enqueueSnackbar]
  );
  const handleValidate = useCallback(
    async (value: string) => {
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
          {t('AccountPage.subscription.membersEditor.limitReached', {
            limit: MAX_MEMBERS + 1,
          })}
        </Alert>
      ) : (
        <Alert severity="info" style={{ marginBottom: 10 }}>
          {t('AccountPage.subscription.membersEditor.info', {
            limit: MAX_MEMBERS,
          })}
        </Alert>
      )}
      <TagInput
        placeholder="Email"
        values={members}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onValidate={handleValidate}
      />
    </Container>
  );
}
const Container = styled.div`
  margin-top: 20px;
`;

export default MembersEditor;
