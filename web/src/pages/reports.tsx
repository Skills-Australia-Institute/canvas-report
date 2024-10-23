import { Button, Text } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

interface ReportActionProps {
  title: string;
  description: string;
  path: string;
}

export const reportsPath = {
  MarkChangeActivity: 'mark-change-activity',
  AdditionalAttemptAssignments: 'additional-attempt-assignments',
};

const reports: ReportActionProps[] = [
  {
    title: 'Mark Change Activity',
    description: 'Mark change activities by trainer in their courses.',
    path: reportsPath.MarkChangeActivity,
  },
  {
    title: 'Additional Attempt Assignments',
    description: 'View additional attempt assignments with needs grading count',
    path: reportsPath.AdditionalAttemptAssignments,
  },
];

export default function Reports() {
  return (
    <div className="w-full">
      <Text className="block font-bold" mb="2">
        Reports
      </Text>
      <div className="flex gap-6">
        {reports.map((r) => (
          <ReportAction
            key={r.title}
            title={r.title}
            description={r.description}
            path={r.path}
          />
        ))}
      </div>
    </div>
  );
}

function ReportAction({ title, description, path }: ReportActionProps) {
  const naviagte = useNavigate();
  return (
    <div className="p-6 rounded-md bg-slate-600 text-white color hover:bg-slate-700 max-w-sm">
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
