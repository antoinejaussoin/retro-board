import { Alert, Button, Checkbox } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { FullUser } from 'common';
import useUser from '../../state/user/useUser';
import useStateFetch from '../../hooks/useStateFetch';
import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import ChangePassword from './ChangePassword';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import { Add, CallMerge, Search } from '@mui/icons-material';
import useModal from 'hooks/useModal';
import { NewAccountModal } from './NewAccountModal';
import Input from 'components/Input';
import { DeleteAccount } from './DeleteAccount';
import { uniq } from 'lodash';
import MergeModal from './MergeModal';
import { mergeUsers } from './api';
import { Stats } from './Stats';

export default function AdminPage() {
  const user = useUser();
  const backend = useBackendCapabilities();
  const [users, setUsers] = useStateFetch<FullUser[]>('/api/admin/users', []);
  const [addOpened, handleAddOpen, handleAddClose] = useModal();
  const [mergeOpened, handleOpenMerge, handleCloseMerge] = useModal();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selected = useMemo(() => {
    return users.filter((u) => selectedIds.includes(u.id));
  }, [selectedIds, users]);

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

  const onMerge = useCallback(
    (main: FullUser, merged: FullUser[]) => {
      handleCloseMerge();
      const removedIds = merged.map((u) => u.id);
      setUsers((prev) => prev.filter((u) => !removedIds.includes(u.id)));
      mergeUsers(main, merged);
    },
    [setUsers, handleCloseMerge]
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

  const columns: GridColDef<FullUser>[] = useMemo(() => {
    return [
      {
        field: '',
        headerName: '',
        renderCell: (p: GridRenderCellParams<any, FullUser>) => {
          return (
            <Checkbox
              checked={selectedIds.includes(p.row.id)}
              onChange={(_, checked) =>
                checked
                  ? setSelectedIds((prev) => uniq([...prev, p.row.id]))
                  : setSelectedIds((prev) =>
                      prev.filter((id) => id !== p.row.id)
                    )
              }
            />
          );
        },
      },
      { field: 'id', headerName: 'ID' },
      { field: 'email', headerName: 'Email', width: 300, filterable: true },
      { field: 'name', headerName: 'Name', width: 300 },
      { field: 'accountType', headerName: 'Acct Type', filterable: true },
      {
        headerName: 'Actions',
        width: 300,
        renderCell: (p: GridRenderCellParams<any, FullUser>) => {
          return (
            <Actions>
              {p.row.accountType === 'password' ? (
                <ChangePassword user={p.row} />
              ) : null}
              <DeleteAccount user={p.row} onDelete={onDelete} />
            </Actions>
          );
        },
      },
    ] as GridColDef[];
  }, [onDelete, selectedIds]);

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
      <StatsContainer>
        <Stats />
      </StatsContainer>
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
        <Button
          startIcon={<CallMerge />}
          onClick={handleOpenMerge}
          disabled={selected.length < 2}
        >
          Merge
        </Button>
      </Header>
      <DataGrid rows={filteredUsers} columns={columns} filterMode="client" />
      <NewAccountModal
        open={addOpened}
        onClose={handleAddClose}
        onAdd={onAdd}
      />
      <MergeModal
        open={mergeOpened}
        onClose={handleCloseMerge}
        users={selected}
        onMerge={onMerge}
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

const StatsContainer = styled.div`
  position: fixed;
  bottom: 18px;
  left: 10px;
`;

const Actions = styled.div``;
