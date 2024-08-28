import { Button, Progress, ScrollArea, Table } from '@radix-ui/themes';
import { useQueries } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import { getUngradedAssignmentsByCourseID } from '../../canvas/assignments';
import { Course } from '../../canvas/courses';
import { useSupabase } from '../../hooks/supabase';
import { Account } from '../../supabase/accounts';
import { getDateTimeString, getFormattedName } from '../../utils';

interface IUngradedAssignments {
  account: Account;
  courses: Course[];
}
export default function UngradedAssignments({
  account,
  courses,
}: IUngradedAssignments) {
  const supabase = useSupabase();
  const { result, isAllSuccess, successCount } = useQueries({
    queries: courses.map((course) => {
      return {
        queryKey: ['courses', course.id, 'ungraded-assignments'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getUngradedAssignmentsByCourseID(
            signal,
            supabase,
            course.id,
            course.name,
            course.account.name
          ),
      };
    }),
    combine: (results) => {
      return {
        result: results.map((result) => (result.data ? result.data : [])),
        isAllSuccess: results.every((result) => result.isSuccess),
        successCount: results.reduce((total, result) => {
          if (result.isSuccess) {
            total++;
          }
          return total;
        }, 0),
      };
    },
  });

  const data = result.flat();
  const accountName = getFormattedName(account.name);

  return (
    <div>
      <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
        <Table.Root size="1">
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
            {data.map((a) => (
              <Table.Row key={a.account + a.course_name + a.section + a.name}>
                <Table.Cell className="max-w-sm">{a.account}</Table.Cell>
                <Table.Cell className="max-w-sm">{a.course_name}</Table.Cell>
                <Table.Cell className="max-w-sm">{a.name}</Table.Cell>
                <Table.Cell className="max-w-sm">{a.section}</Table.Cell>
                <Table.Cell>{a.needs_grading_section}</Table.Cell>
                <Table.Cell className="max-w-sm">{a.teachers}</Table.Cell>
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
            ))}
          </Table.Body>
        </Table.Root>
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        {!isAllSuccess && (
          <Progress
            value={(successCount / courses.length) * 100}
            size="3"
            className="w-full mt-4"
            color="green"
          />
        )}
        {isAllSuccess && (
          <>
            <CSVLink
              data={data.filter(
                (d) =>
                  !(
                    d.section.includes('ADL') ||
                    d.section.includes('Adl') ||
                    d.section.includes('ADELAIDE') ||
                    d.section.includes('Adelaide')
                  )
              )}
              headers={headers}
              filename={`${accountName}_Perth_enrollments_results-${getDateTimeString()}`}
            >
              <Button className="cursor-pointer mr-4" color="teal">
                Download Perth
              </Button>
            </CSVLink>
            <CSVLink
              data={data.filter(
                (d) =>
                  d.section.includes('ADL') ||
                  d.section.includes('Adl') ||
                  d.section.includes('ADELAIDE') ||
                  d.section.includes('Adelaide')
              )}
              headers={headers}
              filename={`${accountName}_Adelaide_enrollments_results-${getDateTimeString()}`}
            >
              <Button className="cursor-pointer" color="cyan">
                Download Adelaide
              </Button>
            </CSVLink>
          </>
        )}
      </div>
    </div>
  );
}

const headers = [
  {
    label: 'Account',
    key: 'account',
  },
  {
    label: 'Course',
    key: 'course_name',
  },
  {
    label: 'Assignment',
    key: 'name',
  },
  {
    label: 'Section',
    key: 'section',
  },
  {
    label: 'Needs Grading',
    key: 'needs_grading_section',
  },
  {
    label: 'Teachers',
    key: 'teachers',
  },
  {
    label: 'Due',
    key: 'due_at',
  },
  {
    label: 'Available From',
    key: 'unlock_at',
  },
  {
    label: 'Until',
    key: 'lock_at',
  },
  {
    label: 'Published',
    key: 'published',
  },
  {
    label: 'Gradebook URL',
    key: 'gradebook_url',
  },
];
