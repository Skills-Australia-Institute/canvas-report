import { Button, ScrollArea, Table } from '@radix-ui/themes';
import { useQueries } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import { getUngradedAssignmentsByCourseID } from '../../api/assignments';
import { Account } from '../../entities/supabase/account';
import { getDateTimeString } from '../../utils';
import Loading from '../loading';

interface IUngradedAssignments {
  account: Account;
}

export default function UngradedAssignments({ account }: IUngradedAssignments) {
  const { pending, data, allSuccess } = useQueries({
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
        data: results.map((result) => (result.data ? result.data : [])),
        pending: results.some((result) => result.isPending),
        allSuccess: results.every((result) => result.isSuccess),
      };
    },
  });

  const allData = data.flat();

  if (pending) {
    <Loading />;
  }

  return (
    <div>
      <ScrollArea
        type="always"
        scrollbars="vertical"
        className="pr-4"
        style={{ height: 600 }}
      >
        {allData.length > 0 && (
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
                  Name
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Section
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Needs Grading
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Teachers
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Gradebook URL
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {allData.map((a) => (
                <Table.Row key={a.account + a.course_name + a.section + a.name}>
                  <Table.Cell className="text-xs">{a.account}</Table.Cell>
                  <Table.Cell className="text-xs">{a.course_name}</Table.Cell>
                  <Table.Cell className="text-xs">{a.name}</Table.Cell>
                  <Table.Cell className="text-xs">{a.section}</Table.Cell>
                  <Table.Cell className="text-xs">
                    {a.needs_grading_section}
                  </Table.Cell>
                  <Table.Cell className="text-xs">{a.teachers}</Table.Cell>
                  <Table.Cell className="text-xs">
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
        )}
      </ScrollArea>
      {allSuccess && (
        <div className="mt-4 border-t pt-4">
          <CSVLink
            data={allData}
            headers={headers}
            filename={`${name}-enrollments_results-${getDateTimeString()}`}
          >
            <Button className="cursor-pointer mr-4" color="teal">
              Download Perth
            </Button>
          </CSVLink>
          <CSVLink
            data={allData}
            headers={headers}
            filename={`${name}-enrollments_results-${getDateTimeString()}`}
          >
            <Button className="cursor-pointer" color="cyan">
              Download Adelaide
            </Button>
          </CSVLink>
        </div>
      )}
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
