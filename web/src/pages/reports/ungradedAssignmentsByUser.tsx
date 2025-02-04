import { Badge, Button, ScrollArea, Table, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useContext, useState } from 'react';
import { CSVLink } from 'react-csv';
import { getUngradedAssignmentsByUserID } from '../../canvas/assignments';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import SearchAndSelectUser from '../../components/searchAndSelectUser';
import { SupabaseUserContext } from '../../providers/supabaseUser';
import { User } from '../../supabase/users';
import {
  getAssignmentStatusColor,
  getDateTimeString,
  getEnrollmentStatusColor,
  getFormattedName,
} from '../../utils';

export default function StudentUngradedAssignmentsPage() {
  const { user: student } = useContext(SupabaseUserContext);
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!student) {
      setErrMsg('Please select a student.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Student Ungraded Assignments Report
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 max-w-xl">
          <SearchAndSelectUser
            onChange={() => {
              setIsProgress(false);
            }}
          />
        </div>
        <div>
          <Button className="block cursor-pointer" type="submit">
            Submit
          </Button>
        </div>

        {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      </form>
      <div className="mt-2">
        {isProgress && student && <UngradedAssignmentsByUser user={student} />}
      </div>
    </div>
  );
}

interface UngradedAssignmentsByUserProps {
  user: User;
}

export function UngradedAssignmentsByUser({
  user,
}: UngradedAssignmentsByUserProps) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', user.id, 'ungraded-assignments'],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getUngradedAssignmentsByUserID(signal, user.id),
  });
  const name = getFormattedName(user.name);

  if (isLoading) {
    return (
      <div className="pt-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <Callout type="error" msg={error.message} className="max-w-lg" />;
  }

  if (data?.length === 0) {
    return (
      <Callout
        type={'success'}
        msg={'No items to display'}
        className="max-w-lg"
      ></Callout>
    );
  }

  return (
    <div>
      <ScrollArea
        type="auto"
        scrollbars="vertical"
        className="pr-4"
        style={{ maxHeight: 600 }}
      >
        {data && (
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Section</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Submitted</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Speedgrader</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((d, i) => (
                <Table.Row
                  key={
                    d.course_name === 'Total'
                      ? i
                      : d.account + d.course_name + d.section + d.title
                  }
                >
                  <Table.Cell className="max-w-sm">{d.account}</Table.Cell>
                  <Table.Cell className="max-w-sm">
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.course_name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">{d.title}</Table.Cell>
                  <Table.Cell>{d.section}</Table.Cell>
                  <Table.Cell>
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.points_possible}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.score && Math.round(d.score * 100) / 100}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {d.course_name !== 'Total' && (
                      <Badge color={getAssignmentStatusColor(d.status)}>
                        {d.status}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">
                    {d.submitted_at !== '' &&
                      new Date(d.submitted_at).toLocaleString('en-AU')}
                  </Table.Cell>
                  <Table.Cell>
                    {d.course_name !== 'Total' && (
                      <Badge
                        color={getEnrollmentStatusColor(d.enrollment_state)}
                      >
                        {d.enrollment_state}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">
                    <a
                      href={d.speedgrader_url}
                      target="_blank"
                      className="underline"
                    >
                      Link
                    </a>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        {data && (
          <CSVLink
            data={data}
            headers={headers}
            filename={`${name}-ungraded_assignments-${getDateTimeString()}`}
          >
            <Button className="cursor-pointer" color="teal">
              Download
            </Button>
          </CSVLink>
        )}
      </div>
    </div>
  );
}

const headers = [
  {
    label: 'SIS ID',
    key: 'user_sis_id',
  },
  {
    label: 'Name',
    key: 'name',
  },
  {
    label: 'Account',
    key: 'account',
  },
  {
    label: 'Course Name',
    key: 'course_name',
  },
  {
    label: 'Section',
    key: 'section',
  },
  {
    label: 'Assignment',
    key: 'title',
  },
  {
    label: 'Points Possible',
    key: 'points_possible',
  },
  {
    label: 'Score',
    key: 'score',
  },
  {
    label: 'Submitted At',
    key: 'submitted_at',
  },
  {
    label: 'Status',
    key: 'status',
  },
  {
    label: 'Course State',
    key: 'course_state',
  },
  {
    label: 'Enrollment Role',
    key: 'enrollment_role',
  },
  {
    label: 'Enrollment State',
    key: 'enrollment_state',
  },
  {
    label: 'Speedgrader URL',
    key: 'speedgrader_url',
  },
];
