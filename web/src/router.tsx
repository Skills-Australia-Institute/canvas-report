import { PropsWithChildren } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/auth';
import Account from './pages/account';
import Accounts from './pages/accounts';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import ResetPassword from './pages/resetPassword';
import User from './pages/user';

export const router = createBrowserRouter([
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
    children: [
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'accounts/:accountID',
        element: <Account />,
      },
      {
        path: 'users/:userID',
        element: <User />,
      },
    ],
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
