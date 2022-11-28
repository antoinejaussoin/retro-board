import { useCallback } from 'react';
import { validate } from 'isemail';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import TagInput from '../../components/TagInput';

type AdminsEditorProps = {
  admins: string[];
  onChange: (admins: string[]) => void;
};

function isValidEmail(email: string): boolean {
  return validate(email);
}

function doesNotExist(members: string[] | null, email: string): boolean {
  return !members || !members.includes(email);
}

function AdminsEditor({ admins, onChange }: AdminsEditorProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = useCallback(
    (value: string) => {
      if (admins && !admins.includes(value)) {
        onChange([...admins, value]);
        enqueueSnackbar(
          t('AccountPage.subscription.adminsEditor.added', { email: value }),
          {
            variant: 'success',
          }
        );
      }
    },
    [admins, onChange, enqueueSnackbar, t]
  );
  const handleRemove = useCallback(
    (value: string) => {
      if (admins && admins.includes(value)) {
        onChange(admins.filter((a) => a !== value));
        enqueueSnackbar(
          t('AccountPage.subscription.adminsEditor.removed', { email: value }),
          {
            variant: 'success',
          }
        );
      }
    },
    [admins, onChange, enqueueSnackbar, t]
  );
  const handleValidate = useCallback(
    async (value: string) => {
      return isValidEmail(value) && doesNotExist(admins, value);
    },
    [admins]
  );

  if (admins === null) {
    return null;
  }

  return (
    <Container>
      <TagInput
        placeholder="Email"
        values={admins}
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

export default AdminsEditor;
