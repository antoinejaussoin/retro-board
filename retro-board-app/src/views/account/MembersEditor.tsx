import React, { useCallback } from 'react';
import ChipInput from 'material-ui-chip-input';
import useStateFetch from '../../hooks/useStateFetch';
import { updateMembers } from './api';
import { validate } from 'isemail';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../translations';

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
      }
    },
    [members, setMembers]
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
      }
    },
    [members, setMembers]
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
      <Title>{translations.subscription?.membersEditor?.title}</Title>
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
      />
    </Container>
  );
}
const Container = styled.div`
  margin-top: 20px;
`;

const Title = styled.div`
  font-size: 1.5em;
  font-weight: 100;
  margin-bottom: 10px;
`;
export default MembersEditor;
