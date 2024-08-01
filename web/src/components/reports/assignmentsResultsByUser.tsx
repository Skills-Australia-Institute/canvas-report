import { Badge, Button, ScrollArea, Table, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import { getAssignmentsResultsByUserID } from '../../api/assignments';
import { User } from '../../entities/supabase/user';
import { useSupabase } from '../../hooks/supabase';
import { getDateTimeString, getFormattedName } from '../../utils';
import Callout from '../callout';
import Loading from '../loading';

interface IAssignmentsResults {
  user: User;
  ungraded?: boolean;
}

export function AssignmentsResultsByUser({
  user,
  ungraded,
}: IAssignmentsResults) {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', user.id, 'assignments-results'],
    queryFn: () => getAssignmentsResultsByUserID(supabase, user.id),
  });
  const name = getFormattedName(user.name);
  const filterData = ungraded
    ? data?.filter((d) => d.submitted_at != '' && d.score === null)
    : data;

  if (isLoading) {
    return (
      <div className="pt-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <Callout type="error" msg={error.message} />;
  }

  return (
    <div>
      <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
        {filterData && (
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filterData.map((d, i) => (
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
                      <Badge
                        color={
                          d.status === 'on_time'
                            ? 'blue'
                            : d.status === 'late'
                            ? 'red'
                            : 'gray'
                        }
                      >
                        {d.status}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">{d.submitted_at}</Table.Cell>
                  <Table.Cell>
                    {d.course_name !== 'Total' && (
                      <Badge
                        color={
                          d.enrollment_state === 'active' ? 'green' : 'blue'
                        }
                      >
                        {d.enrollment_state}
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        {filterData && (
          <CSVLink
            data={filterData}
            headers={headers}
            filename={`${name}-assignments_results-${getDateTimeString()}`}
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
    label: 'Discrepancy',
    key: 'discrepancy',
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
    label: 'Due At',
    key: 'due_at',
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
];
