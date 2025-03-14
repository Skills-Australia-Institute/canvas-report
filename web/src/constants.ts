import SAILogoFull from './assets/sai-logo-full.png';
import SAILogo from './assets/sai-logo.png';
import StanleyLogoFull from './assets/stanley-logo-full.png';
import StanleyLogo from './assets/stanley-logo.png';

export const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8080'
    : import.meta.env.VITE_API_BASE_URL;

export const APP = import.meta.env.VITE_APP;

export const LOGO = APP === 'stanley' ? StanleyLogo : SAILogo;

export const LOGO_FULL = APP === 'stanley' ? StanleyLogoFull : SAILogoFull;

export const ACTIONS = {
  UngradedAssignments: {
    key: 'UngradedAssignments',
    value: 'Ungraded assignments',
  },
  AssignmentsResultsByUser: {
    key: 'AssignmentsResultsByUser',
    value: 'Assignments results',
  },
  UngradedAssignmentsByUser: {
    key: 'UngradedAssignmentsByUser',
    value: 'Ungraded assignments',
  },
  EnrollmentsResultsByUser: {
    key: 'EnrollmentsResultsByUser',
    value: 'Enrollments results',
  },
  UngradedAssignmentsByCourse: {
    key: 'UngradedAssignmentsByCourse',
    value: 'Ungraded assignments',
  },
};

export const APP_ROLES = [
  'Compliance',
  'Superadmin',
  'Admin',
  'Student Services',
];

export enum AppRole {
  Superadmin = 'Superadmin',
  Admin = 'Admin',
  Compliance = 'Compliance',
  StudentServices = 'Student Services',
}

// User has access to their value and higher values.
export const AppRoleValue = new Map<AppRole, number>([
  [AppRole.Superadmin, 4],
  [AppRole.Admin, 3],
  [AppRole.Compliance, 2],
  [AppRole.StudentServices, 1],
]);

export const ReportsPath = {
  MarkChangeActivity: 'mark-change-activity',
  AdditionalAttemptAssignments: 'additional-attempt-assignments',
  StudentEnrollmentsResult: 'student-enrollments-result',
  StudentAssignmentsResult: 'student-assignments-result',
  StudentUngradedAssignments: 'student-ungraded-assignments',
  UngradedAssignments: 'ungraded-assignments',
  CoursesEnrollmentsResult: 'courses-enrollments-result',
};
