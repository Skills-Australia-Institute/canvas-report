import { Button, Text } from '@radix-ui/themes';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppRole, AppRoleValue, ReportsPath } from '../constants';
import { useAuth } from '../hooks/auth';

interface ReportActionProps {
  title: string;
  description: string;
  path: string;
  access?: AppRole;
}

const reports: ReportActionProps[] = [
  {
    title: 'Ungraded Assignments',
    description: 'View ungraded assignments of an account',
    path: ReportsPath.UngradedAssignments,
    access: AppRole.Compliance,
  },
  {
    title: 'Mark Change Activity',
    description: 'Mark change activities by trainer in their courses',
    path: ReportsPath.MarkChangeActivity,
    access: AppRole.Compliance,
  },
  {
    title: 'Additional Attempt Assignments',
    description: 'View additional attempt assignments',
    path: ReportsPath.AdditionalAttemptAssignments,
    access: AppRole.Compliance,
  },
  {
    title: 'Student Enrollments Result',
    description: `View student's all enrollments result`,
    path: ReportsPath.StudentEnrollmentsResult,
  },
  {
    title: 'Student Assignments Result',
    description: `View student's all assignments result`,
    path: ReportsPath.StudentAssignmentsResult,
  },
  {
    title: 'Student Ungraded Assignments',
    description: `View student's all ungraded assignments`,
    path: ReportsPath.StudentUngradedAssignments,
  },
  {
    title: 'Courses Enrollments Result',
    description: `View courses'student enrollments result`,
    path: ReportsPath.CoursesEnrollmentsResult,
  },
];

export default function Reports() {
  return (
    <div className="w-full">
      <Text className="block font-bold" mb="2">
        Reports
      </Text>
      <div className="flex gap-6 flex-wrap">
        {reports.map((r) => (
          <ReportAction
            key={r.title}
            title={r.title}
            description={r.description}
            path={r.path}
            access={r.access}
          />
        ))}
      </div>
    </div>
  );
}

function ReportAction({ title, description, path, access }: ReportActionProps) {
  const { user } = useAuth();
  const naviagte = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const accessValue = access && AppRoleValue.get(access);

  const userRoleValue = user.app_role && AppRoleValue.get(user.app_role);

  if (accessValue && userRoleValue && accessValue > userRoleValue) {
    return <></>;
  }

  return (
    <div className="p-6 rounded-md bg-slate-700 text-white color hover:bg-slate-600 max-w-sm">
      <Text className="block font-bold mb-1">{title}</Text>
      <Text className="block" size="2">
        {description}
      </Text>
      <Button
        className="bg-cyan-500 cursor-pointer hover:bg-cyan-400 mt-4"
        onClick={() => naviagte(path)}
      >
        Click here
      </Button>
    </div>
  );
}
