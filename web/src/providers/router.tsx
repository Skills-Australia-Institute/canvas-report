import { RouterProvider as RP } from 'react-router-dom';

import { PropsWithChildren } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import DashboardPage from '../pages/dashboard';
import ForgotPasswordPage from '../pages/forgotPassword';
import LoginPage from '../pages/login';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
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
