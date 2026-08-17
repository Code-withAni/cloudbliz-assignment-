import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied: admin privileges required');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
