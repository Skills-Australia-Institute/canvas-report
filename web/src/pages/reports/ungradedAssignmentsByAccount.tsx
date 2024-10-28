import { Button, ScrollArea, Table } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import { getUngradedAssignmentsByAccountID } from '../../canvas/assignments';
import { Course } from '../../canvas/courses';
import { useSupabase } from '../../hooks/supabase';
import { Account } from '../../supabase/accounts';
import { getDateTimeString, getFormattedName } from '../../utils';
import Callout from "../../components/callout"
import Loading from '../../components/loading';


interface IUngradedAssignments {
  account: Account;
  courses: Course[];
}

export default function UngradedAssignmentsByAccount({
  account,
}: IUngradedAssignments) {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts', account.id, 'ungraded-assignments'],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getUngradedAssignmentsByAccountID(signal, supabase, account.id),
  });

  const accountName = getFormattedName(account.name);

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
        {data && (
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
        )}
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        {data && (
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
              filename={`PERTH_${accountName}_ungraded_assignments-${getDateTimeString()}`}
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
              filename={`ADL_${accountName}_ungraded_assignments-${getDateTimeString()}`}
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
