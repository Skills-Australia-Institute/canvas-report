import { Badge, Button, ScrollArea, Table } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import { getEnrollmentsResultsByUserID } from '../../api/enrollments';
import { User } from '../../entities/supabase/user';
import { getDateTimeString, getFormattedName } from '../../utils';
import Callout from '../callout';
import Loading from '../loading';

interface IEnrollmentsResults {
  user: User;
}

export default function EnrollmentsResultsByUser({
  user,
}: IEnrollmentsResults) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', user.id, 'enrollments-results'],
    queryFn: () => getEnrollmentsResultsByUserID(user.id),
  });
  const name = getFormattedName(user.name);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Callout type="error" msg={error.message} />;
  }

  return (
    <div>
      <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
        {data && (
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="text-xs">
                  Account
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Course
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Section
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Grade
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Score
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Enrollment
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Grade URL
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((d) => (
                <Table.Row key={d.name + d.course_name + d.section}>
                  <Table.Cell className="text-xs">{d.account}</Table.Cell>
                  <Table.Cell className="text-xs">{d.course_name}</Table.Cell>
                  <Table.Cell className="text-xs">{d.section}</Table.Cell>
                  <Table.Cell className="text-xs">{d.current_grade}</Table.Cell>
                  <Table.Cell className="text-xs">{d.current_score}</Table.Cell>
                  <Table.Cell className="text-xs">
                    <Badge
                      color={d.enrollment_state === 'active' ? 'green' : 'teal'}
                    >
                      {d.enrollment_state}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-xs">
                    <a
                      href={d.grades_url}
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
            filename={`${name}-enrollments_results-${getDateTimeString()}`}
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
    key: 'sis_id',
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
    label: 'Enrollment State',
    key: 'enrollment_state',
  },
  {
    label: 'Course State',
    key: 'course_state',
  },
  {
    label: 'Current Grade',
    key: 'current_grade',
  },
  {
    label: 'Current Score',
    key: 'current_score',
  },
  {
    label: 'Enrollment Role',
    key: 'enrollment_role',
  },
  {
    label: 'Grades URL',
    key: 'grades_url',
  },
];
