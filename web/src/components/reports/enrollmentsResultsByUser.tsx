import { Badge, Table, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { getEnrollmentsResultsByUserID } from '../../api/enrollments';
import { User } from '../../entities/supabase/user';
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

  if (isLoading) {
    <Loading />;
  }

  if (error) {
    <Callout type="error" msg={error.message} />;
  }

  return (
    <div>
      {data && (
        <Table.Root variant="surface" className="mb-4 mt-2">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Section</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade URL</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((d) => (
              <Table.Row key={d.name + d.course_name + d.section}>
                <Table.Cell>
                  <Text>{d.account}</Text>
                </Table.Cell>
                <Table.Cell>{d.course_name}</Table.Cell>
                <Table.Cell>{d.section}</Table.Cell>
                <Table.Cell>{d.current_grade}</Table.Cell>
                <Table.Cell>{d.current_score}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={d.enrollment_state === 'active' ? 'green' : 'teal'}
                  >
                    {d.enrollment_state}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <a href={d.grades_url} target="_blank" className="underline">
                    Link
                  </a>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  );
}
