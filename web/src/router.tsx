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
import Profile from './pages/profile';
import Reports, { reportsPath } from './pages/reports';
import AdditionalAttemptAssigments from './pages/reports/additionalAttemptAssignments';
import MarkChangeActivity, {
  GraderProvider,
} from './pages/reports/markChangeActivity';
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
      {
        path: 'reports',
        element: <Reports />,
        errorElement: <NotFound />,
      },
      {
        path: `reports/${reportsPath.MarkChangeActivity}`,
        element: (
          <GraderProvider>
            <MarkChangeActivity />
          </GraderProvider>
        ),
      },
      {
        path: `reports/${reportsPath.AdditionalAttemptAssignments}`,
        element: (
          <GraderProvider>
            <AdditionalAttemptAssigments />
          </GraderProvider>
        ),
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
