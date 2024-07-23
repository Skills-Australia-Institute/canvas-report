import { PropsWithChildren, useContext } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Account from './pages/account';
import Accounts from './pages/accounts';
import Course from './pages/course';
import Courses from './pages/courses';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import ResetPassword from './pages/resetPassword';
import User from './pages/user';
import Users from './pages/users';
import { SessionContext } from './providers/session';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
    children: [
      {
        path: 'accounts/:accountID',
        element: <Account />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'users/:userID',
        element: <User />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'courses/:courseID',
        element: <Course />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
    ],
  },
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
]);

function RequireAuth(props: PropsWithChildren) {
  const session = useContext(SessionContext);

  if (!session) {
    return <Navigate to="/login" />;
  } else {
    return <>{props.children}</>;
  }
}
