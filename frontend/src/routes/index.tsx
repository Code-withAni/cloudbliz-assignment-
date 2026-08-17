import { createBrowserRouter } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserManagement from '../pages/UserManagement';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/users',
                element: <UserManagement />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
