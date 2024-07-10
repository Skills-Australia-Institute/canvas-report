import { PropsWithChildren } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider as RP,
} from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import Dashboard from '../pages/dashboard';
import ForgotPassword from '../pages/forgotPassword';
import Login from '../pages/login';
import ResetPassword from '../pages/resetPassword';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/hello',
    element: <RequireAuth></RequireAuth>,
  },
]);

function RequireAuth(props: PropsWithChildren) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  } else {
    return props.children;
  }
}

export default function RouterProvider() {
  return <RP router={router} />;
}
