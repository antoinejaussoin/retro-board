import { Alert, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FullUser } from 'common';
import useUser from '../../auth/useUser';
import useStateFetch from '../../hooks/useStateFetch';
import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import ChangePassword from './ChangePassword';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import { Add, Search } from '@mui/icons-material';
import useModal from 'hooks/useModal';
import { NewAccountModal } from './NewAccountModal';
import Input from 'components/Input';
import { DeleteAccount } from './DeleteAccount';

export default function AdminPage() {
  const user = useUser();
  const backend = useBackendCapabilities();
  const [users, setUsers] = useStateFetch<FullUser[]>('/api/admin/users', []);
  const [addOpened, handleAddOpen, handleAddClose] = useModal();
  const [search, setSearch] = useState('');

  const onAdd = useCallback(
    (user: FullUser) => {
      setUsers((users) => [user, ...users]);
      handleAddClose();
    },
    [setUsers, handleAddClose]
  );

  const onDelete = useCallback(
    (user: FullUser) => {
      setUsers((users) => users.filter((u) => u.id !== user.id));
    },
    [setUsers]
  );

  const filteredUsers = useMemo(() => {
    if (!search) {
      return users;
    }
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email ? u.email.toLowerCase().includes(search.toLowerCase()) : false)
    );
  }, [search, users]);

  const columns: GridColDef[] = useMemo(() => {
    return [
      { field: 'email', headerName: 'Email', width: 300, filterable: true },
      { field: 'name', headerName: 'Name', width: 300 },
      {
        field: '',
        headerName: 'Actions',
        width: 300,
        renderCell: (p) => (
          <Actions>
            <ChangePassword user={p.row} />
            <DeleteAccount user={p.row} onDelete={onDelete} />
          </Actions>
        ),
      },
    ] as GridColDef[];
  }, [onDelete]);

  if (!backend.selfHosted) {
    return (
      <Alert severity="error">
        This page is only accessible for self-hosted instances.
      </Alert>
    );
  }
  if (!user || user.email !== backend.adminEmail) {
    return (
      <Alert severity="error">
        This page is only accessible for the Self-Hosted Administrator (
        {backend.adminEmail}).
      </Alert>
    );
  }
  return (
    <Container>
      <Header>
        <Input
          title="Search"
          leftIcon={<Search />}
          value={search}
          onChangeValue={setSearch}
          style={{ margin: 0, flex: 1 }}
        />
        <Button startIcon={<Add />} onClick={handleAddOpen}>
          Add a new user
        </Button>
      </Header>
      <DataGrid rows={filteredUsers} columns={columns} filterMode="client" />
      <NewAccountModal
        open={addOpened}
        onClose={handleAddClose}
        onAdd={onAdd}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px);
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  gap: 5px;
  margin: 10px;
`;

const Actions = styled.div``;
