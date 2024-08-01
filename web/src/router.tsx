import { PropsWithChildren, useContext } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/auth';
import Account from './pages/account';
import Accounts from './pages/accounts';
import Course from './pages/course';
import Courses from './pages/courses';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import NotFound from './pages/notFound';
import OAuth2Response from './pages/oauth2Response';
import Profile from './pages/profile';
import ResetPassword from './pages/resetPassword';
import Superadmin from './pages/superadmin';
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
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Navigate to="/accounts" />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
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
  {
    path: '/app',
    element: (
      <RequireSuperadmin>
        <Dashboard />
      </RequireSuperadmin>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Superadmin />,
      },
      {
        path: 'oauth2response',
        element: <OAuth2Response />,
      },
    ],
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

function RequireSuperadmin(props: PropsWithChildren) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  } else if (user.app_role !== 'Superadmin') {
    return <Navigate to="/" />;
  } else {
    return <>{props.children}</>;
  }
}
