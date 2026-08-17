import { Plus, Search, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your customer enquiries at a glance.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Enquiry
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open enquiries', value: '24' },
          { label: 'Resolved today', value: '9' },
          { label: 'Avg. response time', value: '2.1h' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <Search className="h-4 w-4 text-slate-400" />
        <p className="text-sm text-slate-500">Your enquiries will appear here.</p>
        <Button variant="outline" size="sm" className="ml-auto">
          <Send className="h-4 w-4" />
          Quick follow-up
        </Button>
      </div>
    </div>
  );
}
