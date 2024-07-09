import { RouterProvider as RP } from 'react-router-dom';

import { PropsWithChildren } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import DashboardPage from '../pages/dashboard';
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
]);

function RequireAuth(props: PropsWithChildren) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    <Navigate to="/login" />;
  } else {
    return props.children;
  }
}

export default function RouterProvider() {
  return <RP router={router} />;
}
