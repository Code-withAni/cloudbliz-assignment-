import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
