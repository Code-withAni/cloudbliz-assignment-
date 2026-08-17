import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Inbox, Loader2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DeleteEnquiryDialog from '../components/enquiries/DeleteEnquiryDialog';
import EditEnquiryDialog from '../components/enquiries/EditEnquiryDialog';
import EnquiriesTable from '../components/enquiries/EnquiriesTable';
import ViewEnquiryDialog from '../components/enquiries/ViewEnquiryDialog';
import { Button } from '../components/ui/Button';
import { enquiryApi, userApi, type Enquiry, type UserSummary } from '../lib/api';

const STATS = [
  { key: 'Total', label: 'Total Enquiries', icon: Inbox, iconClass: 'bg-slate-100 text-slate-700' },
  { key: 'New', label: 'New', icon: Sparkles, iconClass: 'bg-blue-50 text-blue-700' },
  {
    key: 'In Progress',
    label: 'In Progress',
    icon: Loader2,
    iconClass: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'Closed',
    label: 'Closed',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-700',
  },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState<Enquiry | null>(null);

  useEffect(() => {
    userApi
      .assignable()
      .then((data) => setUsers(data.users))
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : 'Failed to load users'),
      );
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enquiryApi.list();
      setEnquiries(data.enquiries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      Total: enquiries.length,
      New: 0,
      'In Progress': 0,
      Closed: 0,
    };
    for (const enquiry of enquiries) {
      result[enquiry.status] += 1;
    }
    return result;
  }, [enquiries]);

  const recent = useMemo(() => enquiries.slice(0, 5), [enquiries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your enquiry pipeline.</p>
        </div>
        <Button data-testid="dashboard-add-enquiry" onClick={() => navigate('/enquiries')}>
          <Plus className="h-4 w-4" />
          Add Enquiry
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.key}
            data-testid={`stat-${stat.key}`}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.iconClass}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{counts[stat.key]}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ClipboardList className="h-5 w-5 text-slate-500" />
              Recent Enquiries
            </h3>
            <p className="text-sm text-slate-500">The most recently created enquiries.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/enquiries')}>
            View all
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center rounded-lg border border-slate-200 bg-white py-16">
            <p className="text-sm text-slate-500">Loading enquiries…</p>
          </div>
        ) : (
          <EnquiriesTable
            enquiries={recent}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}
      </div>

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
