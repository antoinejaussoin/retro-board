import { Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FullUser } from '@retrospected/common';
import useUser from '../../auth/useUser';
import useAdminEmail from '../../global/useAdminEmail';
import useStateFetch from '../../hooks/useStateFetch';
import { useMemo } from 'react';
import styled from '@emotion/styled';
import ChangePassword from './ChangePassword';
import useIsSelfHosted from '../../global/useIsSelfHosted';

export default function AdminPage() {
  const user = useUser();
  const adminEmail = useAdminEmail();
  const isSelfHosted = useIsSelfHosted();
  const [users] = useStateFetch<FullUser[]>('/api/admin/users', []);

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

  if (!isSelfHosted) {
    <Alert severity="error">
      This page is only accessible for self-hosted instances.
    </Alert>;
  }
  if (!user || user.email !== adminEmail) {
    return (
      <Alert severity="error">
        This page is only accessible for the Self-Hosted Administrator (
        {adminEmail}).
      </Alert>
    );
  }
  return (
    <Container>
      <DataGrid rows={users} columns={columns} />
    </Container>
  );
}

const Container = styled.div`
  height: calc(100vh - 65px);
  width: 100%;
`;
