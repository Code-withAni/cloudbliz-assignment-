import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import CreateUserDialog from '../components/users/CreateUserDialog';
import DeleteUserDialog from '../components/users/DeleteUserDialog';
import EditUserDialog from '../components/users/EditUserDialog';
import { Button } from '../components/ui/Button';
import { userApi, type AuthUser } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

function RoleBadge({ role }: { role: AuthUser['role'] }) {
  return (
    <span
      data-testid={`role-badge-${role}`}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        role === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-800',
      )}
    >
      {role === 'admin' ? 'Admin' : 'Staff'}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [deleting, setDeleting] = useState<AuthUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
      setUsers(data.users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Manage staff and admin accounts.</p>
        </div>
        <Button data-testid="open-create-user" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-lg border border-slate-200 bg-white py-16">
          <p className="text-sm text-slate-500">Loading users…</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === me?.id;
                return (
                  <tr
                    key={user.id}
                    data-testid={`user-row-${user.email}`}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                        {user.name}
                        {isSelf ? (
                          <span className="text-xs font-normal text-slate-400">(you)</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`edit-user-${user.email}`}
                          onClick={() => setEditing(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`delete-user-${user.email}`}
                          onClick={() => setDeleting(user)}
                          aria-label={`Delete ${user.name}`}
                          disabled={isSelf}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refresh} />
      <EditUserDialog
        key={editing?.id ?? 'none'}
        user={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        onUpdated={refresh}
      />
      <DeleteUserDialog
        user={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
