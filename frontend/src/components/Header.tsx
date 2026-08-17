import { Bell, ChevronDown, LogOut, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu } from 'radix-ui';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">CloudBlitz</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-full text-sm text-slate-700 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden max-w-[160px] truncate font-medium sm:inline">
                {user?.name ?? 'Account'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[160px] rounded-md border border-slate-200 bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenu.Item className="cursor-pointer rounded-sm px-3 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100">
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="cursor-pointer rounded-sm px-3 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100">
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
