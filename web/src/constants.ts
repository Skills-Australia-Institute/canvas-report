import SAILogoFull from './assets/sai-logo-full.png';
import SAILogo from './assets/sai-logo.png';
import StanleyLogoFull from './assets/stanley-logo-full.png';
import StanleyLogo from './assets/stanley-logo.png';

export const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8080/api'
    : import.meta.env.VITE_API_BASE_URL;

export const APP = import.meta.env.VITE_APP;

export const LOGO = APP === 'stanley' ? StanleyLogo : SAILogo;

export const LOGO_FULL = APP === 'stanley' ? SAILogoFull : StanleyLogoFull;

export const ACTIONS = {
  UngradedAssignments: {
    key: 'UngradedAssignments',
    value: 'Ungraded assignments',
  },
  AssignmentsResultsByUser: {
    key: 'AssignmentsResultsByUser',
    value: 'Assignments results',
  },
  UngradedAssignmentsResultsByUser: {
    key: 'UngradedAssignmentsResultsByUser',
    value: 'Ungraded assignments',
  },
  EnrollmentsResultsByUser: {
    key: 'EnrollmentsResultsByUser',
    value: 'Enrollments results',
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
