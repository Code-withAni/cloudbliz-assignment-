import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { toast } from 'sonner';
import AddEnquiryDialog from '../components/enquiries/AddEnquiryDialog';
import DeleteEnquiryDialog from '../components/enquiries/DeleteEnquiryDialog';
import EditEnquiryDialog from '../components/enquiries/EditEnquiryDialog';
import EnquiriesTable from '../components/enquiries/EnquiriesTable';
import ViewEnquiryDialog from '../components/enquiries/ViewEnquiryDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  enquiryApi,
  userApi,
  type Enquiry,
  type EnquiryStatus,
  type UserSummary,
} from '../lib/api';

type TabValue = 'All' | EnquiryStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Closed', label: 'Closed' },
];

export default function Dashboard() {
  const [tab, setTab] = useState<TabValue>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState<Enquiry | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    userApi
      .list()
      .then((data) => setUsers(data.users))
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : 'Failed to load users'),
      );
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params: { status?: EnquiryStatus; assignedTo?: string; search?: string } = {};
      if (tab !== 'All') params.status = tab;
      if (assignedFilter !== 'all') params.assignedTo = assignedFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const data = await enquiryApi.list(params);
      setEnquiries(data.enquiries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [tab, assignedFilter, debouncedSearch]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Enquiries</h2>
          <p className="text-sm text-slate-500">Track and manage customer enquiries.</p>
        </div>
        <Button data-testid="open-add-enquiry" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Enquiry
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="enquiry-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or email…"
            className="pl-9"
          />
        </div>
        <div className="sm:w-56">
          <Select
            ariaLabel="Filter by assigned to"
            value={assignedFilter}
            onValueChange={setAssignedFilter}
            options={[
              { value: 'all', label: 'All assignees' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        </div>
      </div>

      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <Tabs.List className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white p-1">
          {TABS.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              data-testid={`tab-${item.value}`}
              className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 outline-none data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center rounded-lg border border-slate-200 bg-white py-16">
              <p className="text-sm text-slate-500">Loading enquiries…</p>
            </div>
          ) : (
            <EnquiriesTable
              enquiries={enquiries}
              onView={setViewing}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          )}
        </div>
      </Tabs.Root>

      <AddEnquiryDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refresh} />
      <ViewEnquiryDialog
        enquiry={viewing}
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      />
      <EditEnquiryDialog
        key={editing?.id ?? 'none'}
        enquiry={editing}
        users={users}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        onUpdated={refresh}
      />
      <DeleteEnquiryDialog
        enquiry={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
