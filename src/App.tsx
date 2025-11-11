import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Login from '@/pages/Login';
import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Upload from '@/pages/Upload';
import Diagnosis from '@/pages/Diagnosis';
import Report from '@/pages/Report';

// 保护路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// 公开路由组件（已登录用户重定向）
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'patients',
        element: <Patients />,
      },
      {
        path: 'upload',
        element: <Upload />,
      },
      {
        path: 'diagnosis',
        element: <Diagnosis />,
      },
      {
        path: 'reports',
        element: <Report />,
      },
    ],
  },
  {
    path: '/diagnosis/:id',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Report />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}