import { Table, Text } from '@radix-ui/themes';
import { useQueries } from '@tanstack/react-query';
import { getUngradedAssignmentsByCourseID } from '../../api/assignments';
import { Account } from '../../entities/supabase/account';
import Loading from '../loading';

interface IUngradedAssignments {
  account: Account;
}

export default function UngradedAssignments({ account }: IUngradedAssignments) {
  const { pending, data } = useQueries({
    queries: account.courses
      ? account.courses.map((course) => {
          return {
            queryKey: ['courses', course.id, 'ungraded-assignments'],
            queryFn: () => getUngradedAssignmentsByCourseID(course.id),
          };
        })
      : [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });

  if (pending) {
    <Loading />;
  }

  return (
    <div>
      <Table.Root variant="surface" className="mb-4 mt-2">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Section</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Needs Grading</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Gradebook URL</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.flat().map(
            (a) =>
              a && (
                <Table.Row key={a.name + a.course_name}>
                  <Table.Cell>
                    <Text>{a.account}</Text>
                  </Table.Cell>
                  <Table.Cell>{a.course_name}</Table.Cell>
                  <Table.Cell>{a.name}</Table.Cell>
                  <Table.Cell>{a.section}</Table.Cell>
                  <Table.Cell>{a.needs_grading_section}</Table.Cell>
                  <Table.Cell>{a.teachers}</Table.Cell>
                  <Table.Cell>
                    <a
                      href={a.gradebook_url}
                      target="_blank"
                      className="underline"
                    >
                      Link
                    </a>
                  </Table.Cell>
                </Table.Row>
              )
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
