import { Merge, Plus, Search } from 'lucide-react';
import { FullUser } from 'common';
import useUser from '../../state/user/useUser';
import useStateFetch from '../../hooks/useStateFetch';
import { useCallback, useMemo, useState } from 'react';
import ChangePassword from './ChangePassword';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import useModal from 'hooks/useModal';
import { NewAccountModal } from './NewAccountModal';
import Input from 'components/Input';
import { DeleteAccount } from './DeleteAccount';
import { uniq } from 'lodash';
import MergeModal from './MergeModal';
import { mergeUsers } from './api';
import { Stats } from './Stats';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { Checkbox } from 'ui/checkbox';

const headCell =
  'sticky top-0 z-10 bg-cream px-3 py-2 font-medium shadow-[inset_0_-1px_0_0_var(--color-line)]';
const bodyCell = 'border-b border-line px-3 py-2 align-middle';

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
    [setUsers, handleAddClose],
  );

  const onDelete = useCallback(
    (user: FullUser) => {
      setUsers((users) => users.filter((u) => u.id !== user.id));
    },
    [setUsers],
  );

  const onMerge = useCallback(
    (main: FullUser, merged: FullUser[]) => {
      handleCloseMerge();
      const removedIds = merged.map((u) => u.id);
      setUsers((prev) => prev.filter((u) => !removedIds.includes(u.id)));
      mergeUsers(main, merged);
    },
    [setUsers, handleCloseMerge],
  );

  const filteredUsers = useMemo(() => {
    if (!search) {
      return users;
    }
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email
          ? u.email.toLowerCase().includes(search.toLowerCase())
          : false),
    );
  }, [search, users]);

  if (!backend.selfHosted) {
    return (
      <div className="p-6">
        <Alert severity="error">
          This page is only accessible for self-hosted instances.
        </Alert>
      </div>
    );
  }
  if (!user || user.email !== backend.adminEmail) {
    return (
      <div className="p-6">
        <Alert severity="error">
          This page is only accessible for the Self-Hosted Administrator (
          {backend.adminEmail}).
        </Alert>
      </div>
    );
  }
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col">
      <div className="flex flex-wrap items-end gap-2 border-b border-line px-4 py-3">
        <div className="min-w-56 flex-1">
          <Input
            title="Search"
            leftIcon={<Search className="size-4" />}
            value={search}
            onChangeValue={setSearch}
            fullWidth
          />
        </div>
        <Button onClick={handleAddOpen}>
          <Plus className="size-4" />
          Add a new user
        </Button>
        <Button
          variant="outline"
          onClick={handleOpenMerge}
          disabled={selected.length < 2}
        >
          <Merge className="size-4" />
          Merge
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th className={`${headCell} w-12`}>
                <span className="sr-only">Select</span>
              </th>
              <th className={headCell}>ID</th>
              <th className={headCell}>Email</th>
              <th className={headCell}>Name</th>
              <th className={headCell}>Acct Type</th>
              <th className={headCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted">
                  No rows
                </td>
              </tr>
            ) : null}
            {filteredUsers.map((row) => (
              <tr key={row.id} className="hover:bg-cream">
                <td className={bodyCell}>
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onCheckedChange={(checked) =>
                      checked
                        ? setSelectedIds((prev) => uniq([...prev, row.id]))
                        : setSelectedIds((prev) =>
                            prev.filter((id) => id !== row.id),
                          )
                    }
                  />
                </td>
                <td className={`${bodyCell} font-mono text-xs`}>{row.id}</td>
                <td className={bodyCell}>{row.email}</td>
                <td className={bodyCell}>{row.name}</td>
                <td className={bodyCell}>{row.accountType}</td>
                <td className={bodyCell}>
                  <div className="flex flex-wrap items-center gap-1">
                    {row.accountType === 'password' ? (
                      <ChangePassword user={row} />
                    ) : null}
                    <DeleteAccount user={row} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line bg-cream px-4 py-2">
        <Stats />
      </div>
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
    </div>
  );
}
