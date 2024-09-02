import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Progress,
  ScrollArea,
  Table,
  Tooltip,
} from '@radix-ui/themes';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { CSVLink } from 'react-csv';
import {
  getUngradedAssignmentsByCourseID,
  UngradedAssignmentWithAccountCourseInfo,
} from '../../canvas/assignments';
import { Course } from '../../canvas/courses';
import { APP } from '../../constants';
import { useSupabase } from '../../hooks/supabase';
import { Account } from '../../supabase/accounts';
import { getDateTimeString, getFormattedName } from '../../utils';
import Callout from '../callout';

interface IUngradedAssignments {
  account: Account;
  courses: Course[];
}
export default function UngradedAssignments({
  account,
  courses,
}: IUngradedAssignments) {
  const supabase = useSupabase();
  const { result, isAllSuccess, successCount, errors } = useQueries({
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
        errors: results.map((result) => (result.error ? result.error : null)),
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

  const errorsOnly = errors.filter((err) => err !== null);

  if (errorsOnly.length > 0) {
    return (
      <>
        {errorsOnly.map((error) => (
          <Callout
            type="error"
            msg={error.message}
            className="max-w-lg"
          ></Callout>
        ))}
      </>
    );
  }

  if (isAllSuccess && data.length === 0) {
    return (
      <Callout
        type={'success'}
        msg={'No items to display'}
        className="max-w-lg"
      ></Callout>
    );
  }

  return (
    <UngradedAssignmentsTable
      isAllSuccess={isAllSuccess}
      data={data}
      accountName={accountName}
      successCount={successCount}
      coursesCount={courses.length}
    />
  );
}

interface UngradedAssignmentsTableProps {
  isAllSuccess: boolean;
  data: UngradedAssignmentWithAccountCourseInfo[];
  accountName: string;
  successCount: number;
  coursesCount: number;
}
type SortBy =
  | 'course-asc'
  | 'course-desc'
  | 'name-asc'
  | 'name-desc'
  | 'section-asc'
  | 'section-desc';

const UngradedAssignmentsTable = ({
  isAllSuccess,
  data,
  accountName,
  successCount,
  coursesCount,
}: UngradedAssignmentsTableProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('section-asc');

  let sorted: UngradedAssignmentWithAccountCourseInfo[] = [];

  if (isAllSuccess) {
    sorted = sort(data, sortBy);
  }

  return (
    <div>
      <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
        {data.length > 0 && (
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  <Tooltip
                    content={`Click to sort by course ${
                      sortBy === 'course-asc'
                        ? 'descending'
                        : sortBy === 'course-desc'
                        ? 'ascending'
                        : 'ascending'
                    }`}
                  >
                    <div className="inline-block">
                      <Flex
                        className="cursor-pointer"
                        align="center"
                        gap="1"
                        onClick={() => {
                          if (sortBy === 'course-asc') {
                            setSortBy('course-desc');
                          } else if (sortBy === 'course-desc') {
                            setSortBy('course-asc');
                          } else {
                            setSortBy('course-asc');
                          }
                        }}
                      >
                        <span>Course</span>

                        {sortBy === 'course-asc' && (
                          <ArrowUpIcon className="cursor-pointer text-blue-500" />
                        )}

                        {sortBy === 'course-desc' && (
                          <ArrowDownIcon className="cursor-pointer text-blue-500" />
                        )}
                      </Flex>
                    </div>
                  </Tooltip>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  <Tooltip
                    content={`Click to sort by name ${
                      sortBy === 'name-asc'
                        ? 'descending'
                        : sortBy === 'name-desc'
                        ? 'ascending'
                        : 'ascending'
                    }`}
                  >
                    <div className="inline-block">
                      <Flex
                        gap="1"
                        align="center"
                        className="cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'name-asc') {
                            setSortBy('name-desc');
                          } else if (sortBy === 'name-desc') {
                            setSortBy('name-asc');
                          } else {
                            setSortBy('name-asc');
                          }
                        }}
                      >
                        <span>Name</span>

                        {sortBy === 'name-asc' && (
                          <ArrowUpIcon className="cursor-pointer text-blue-500" />
                        )}

                        {sortBy === 'name-desc' && (
                          <ArrowDownIcon className="cursor-pointer text-blue-500" />
                        )}
                      </Flex>
                    </div>
                  </Tooltip>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  <Tooltip
                    content={`Click to sort by section ${
                      sortBy === 'section-asc'
                        ? 'descending'
                        : sortBy === 'section-desc'
                        ? 'ascending'
                        : 'ascending'
                    }`}
                  >
                    <div className="inline-block">
                      <Flex
                        align="center"
                        gap="1"
                        className="cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'section-asc') {
                            setSortBy('section-desc');
                          } else if (sortBy === 'section-desc') {
                            setSortBy('section-asc');
                          } else {
                            setSortBy('section-asc');
                          }
                        }}
                      >
                        <span>Section</span>

                        {sortBy === 'section-asc' && (
                          <ArrowUpIcon className="cursor-pointer text-blue-500" />
                        )}

                        {sortBy === 'section-desc' && (
                          <ArrowDownIcon className="cursor-pointer text-blue-500" />
                        )}
                      </Flex>
                    </div>
                  </Tooltip>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Needs Grading</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Gradebook URL</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((a) => (
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
        {!isAllSuccess && (
          <Progress
            value={(successCount / coursesCount) * 100}
            size="3"
            className="max-w-3xl mt-4"
            color="green"
          />
        )}
        {isAllSuccess && APP === 'sai' && (
          <>
            <CSVLink
              data={sorted.filter(
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
              data={sorted.filter(
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
        {isAllSuccess && APP === 'stanley' && (
          <CSVLink
            data={sorted}
            headers={headers}
            filename={`${accountName}_ungraded_assignments-${getDateTimeString()}`}
          >
            <Button className="cursor-pointer" color="cyan">
              Download
            </Button>
          </CSVLink>
        )}
      </div>
    </div>
  );
};

function sort(data: UngradedAssignmentWithAccountCourseInfo[], by: SortBy) {
  const sorted = [...data];

  switch (by) {
    case 'course-asc':
      return sorted.sort((a, b) => a.course_name.localeCompare(b.course_name));
    case 'course-desc':
      return sorted.sort((a, b) => b.course_name.localeCompare(a.course_name));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'section-asc':
      return sorted.sort((a, b) => a.section.localeCompare(b.section));
    case 'section-desc':
      return sorted.sort((a, b) => b.section.localeCompare(a.section));
    default:
      return sorted;
  }
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
