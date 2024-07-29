export const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8080/api'
    : import.meta.env.VITE_API_BASE_URL;

export const ACTIONS = {
  UngradedAssignments: {
    key: 'UngradedAssignments',
    value: 'Ungraded assignments',
  },
  AssignmentsResultsByUser: {
    key: 'AssignmentsResultsByUser',
    value: 'Assignments results',
  },
  EnrollmentsResultsByUser: {
    key: 'EnrollmentsResultsByUser',
    value: 'Enrollments results',
  },
};

export const APP_ROLES = [
  'Superadmin',
  'Admin',
  'Compliance',
  'Student Services',
];
