export const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8080/api'
    : import.meta.env.VITE_API_BASE_URL;
export const CANVAS_CLIENT_ID = import.meta.env.VITE_CANVAS_CLIENT_ID;
export const CANVAS_BASE_URL = import.meta.env.VITE_CANVAS_BASE_URL;
export const CANVAS_OAUTH2_REDIRECT_URI = import.meta.env
  .VITE_CANVAS_OAUTH2_REDIRECT_URI;
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
  'Compliance',
  'Superadmin',
  'Admin',
  'Student Services',
];
