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

export default function AdminPage() {
  const user = useUser();
  const backend = useBackendCapabilities();
  const [users, setUsers] = useStateFetch<FullUser[]>('/api/admin/users', []);
  const [opened, handleOpen, handleClose] = useModal();
  const [search, setSearch] = useState('');

  const onAdd = useCallback(
    (user: FullUser) => {
      setUsers((users) => [user, ...users]);
      handleClose();
    },
    [setUsers, handleClose]
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
        width: 200,
        renderCell: (p) => <ChangePassword user={p.row as FullUser} />,
      },
    ] as GridColDef[];
  }, []);

  if (!backend.selfHosted) {
    <Alert severity="error">
      This page is only accessible for self-hosted instances.
    </Alert>;
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
      <Button startIcon={<Add />} onClick={handleOpen}>
        Add a new user
      </Button>
      <Input
        title="Search"
        leftIcon={<Search />}
        value={search}
        onChangeValue={setSearch}
      />
      <DataGrid rows={filteredUsers} columns={columns} filterMode="client" />
      <NewAccountModal open={opened} onClose={handleClose} onAdd={onAdd} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px);
  width: 100%;
`;
