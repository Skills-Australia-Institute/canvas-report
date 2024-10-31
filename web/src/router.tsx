import { PropsWithChildren, useContext } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import NotFound from './components/notFound';
import { useAuth } from './hooks/auth';
import Account from './pages/account';
import Accounts from './pages/accounts';
import Course from './pages/course';
import Courses from './pages/courses';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import NotFoundPage from './pages/notFound';
import Profile from './pages/profile';
import Reports, { reportsPath } from './pages/reports';
import AdditionalAttemptAssigments from './pages/reports/additionalAttemptAssignments';
import StudentAssignmentsResultPage from './pages/reports/assignmentsResultByUser';
import StudentEnrollmentsResultPage from './pages/reports/enrollmentsResultByUser';
import EnrollmentsResultInCoursesPage from './pages/reports/enrollmentsResultInCourses';
import MarkChangeActivity from './pages/reports/markChangeActivity';
import UngradedAssignmentsByAccountPage from './pages/reports/ungradedAssignmentsByAccount';
import StudentUngradedAssignmentsPage from './pages/reports/ungradedAssignmentsByUser';
import ResetPassword from './pages/resetPassword';
import Superadmin from './pages/superadmin';
import User from './pages/user';
import Users from './pages/users';
import { SessionContext } from './providers/session';
import { SupabaseCoursesProvider } from './providers/supabaseCourses';
import { SupabaseUserProvider } from './providers/supabaseUser';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '',
        element: <Navigate to="/reports" />,
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
        errorElement: <NotFoundPage />,
      },
      {
        path: `reports/${reportsPath.MarkChangeActivity}`,
        element: (
          <RequireComplianceRole>
            <SupabaseUserProvider>
              <MarkChangeActivity />
            </SupabaseUserProvider>
          </RequireComplianceRole>
        ),
      },
      {
        path: `reports/${reportsPath.AdditionalAttemptAssignments}`,
        element: (
          <RequireComplianceRole>
            <AdditionalAttemptAssigments />
          </RequireComplianceRole>
        ),
      },
      {
        path: `reports/${reportsPath.StudentEnrollmentsResult}`,
        element: (
          <SupabaseUserProvider>
            <StudentEnrollmentsResultPage />
          </SupabaseUserProvider>
        ),
      },
      {
        path: `reports/${reportsPath.StudentAssignmentsResult}`,
        element: (
          <SupabaseUserProvider>
            <StudentAssignmentsResultPage />
          </SupabaseUserProvider>
        ),
      },
      {
        path: `reports/${reportsPath.StudentUngradedAssignments}`,
        element: (
          <SupabaseUserProvider>
            <StudentUngradedAssignmentsPage />
          </SupabaseUserProvider>
        ),
      },
      {
        path: `reports/${reportsPath.UngradedAssignments}`,
        element: (
          <RequireComplianceRole>
            <UngradedAssignmentsByAccountPage />
          </RequireComplianceRole>
        ),
      },
      {
        path: `reports/${reportsPath.CoursesEnrollmentsResult}`,
        element: (
          <SupabaseCoursesProvider>
            <EnrollmentsResultInCoursesPage />
          </SupabaseCoursesProvider>
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
      <RequireSuperadminRole>
        <Dashboard />
      </RequireSuperadminRole>
    ),
    errorElement: <NotFoundPage />,
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

function RequireSuperadminRole(props: PropsWithChildren) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  } else if (user.app_role !== 'Superadmin') {
    return <NotFound />;
  } else {
    return <>{props.children}</>;
  }
}

function RequireComplianceRole(props: PropsWithChildren) {
  const { user } = useAuth();
  user?.app_role;

  if (!user) {
    return <Navigate to="/login" />;
  } else if (
    user.app_role == 'Superadmin' ||
    user.app_role == 'Admin' ||
    user.app_role == 'Compliance'
  ) {
    return <>{props.children}</>;
  } else {
    return <NotFound />;
  }
}
