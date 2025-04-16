import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Flex,
  ScrollArea,
  Table,
  Tooltip,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CSVLink } from 'react-csv';
import {
  EnrollmentResult,
  getEnrollmentsResultsByUserID,
} from '../../canvas/enrollments';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import { User } from '../../supabase/users';
import {
  getDateTimeString,
  getEnrollmentStatusColor,
  getFormattedName,
} from '../../utils';

interface IEnrollmentsResults {
  user: User;
}

type SortBy =
  | 'account-asc'
  | 'account-desc'
  | 'course-asc'
  | 'course-desc'
  | 'section-asc'
  | 'section-desc';

export default function EnrollmentsResultsByUser({
  user,
}: IEnrollmentsResults) {
  const [sortBy, setSortBy] = useState<SortBy>('section-asc');
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', user.id, 'enrollments-results'],
    queryFn: ({ signal }) => getEnrollmentsResultsByUserID(signal, user.id),
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

  const sorted = data ? sort(data, sortBy) : [];

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
                <Table.ColumnHeaderCell>
                  <Tooltip
                    content={`Click to sort by account ${
                      sortBy === 'account-asc'
                        ? 'descending'
                        : sortBy === 'account-desc'
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
                          if (sortBy === 'account-asc') {
                            setSortBy('account-desc');
                          } else if (sortBy === 'account-desc') {
                            setSortBy('account-asc');
                          } else {
                            setSortBy('account-asc');
                          }
                        }}
                      >
                        <span>Account</span>
                        {sortBy === 'account-asc' && (
                          <ArrowUpIcon className="cursor-pointer text-blue-500 w-4 h-4" />
                        )}

                        {sortBy === 'account-desc' && (
                          <ArrowDownIcon
                            className="cursor-pointer text-blue-500 w-4 h-4"
                            fontSize="20"
                          />
                        )}
                      </Flex>
                    </div>
                  </Tooltip>
                </Table.ColumnHeaderCell>
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
                          <ArrowUpIcon className="cursor-pointer text-blue-500 w-4 h-4" />
                        )}

                        {sortBy === 'course-desc' && (
                          <ArrowDownIcon className="cursor-pointer text-blue-500 w-4 h-4" />
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
                          <ArrowUpIcon className="cursor-pointer text-blue-500 w-4 h-4" />
                        )}

                        {sortBy === 'section-desc' && (
                          <ArrowDownIcon className="cursor-pointer text-blue-500 w-4 h-4" />
                        )}
                      </Flex>
                    </div>
                  </Tooltip>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Grade URL</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((d) => (
                <Table.Row key={d.name + d.course_name + d.section}>
                  <Table.Cell>{d.account}</Table.Cell>
                  <Table.Cell>{d.course_name}</Table.Cell>
                  <Table.Cell>{d.section}</Table.Cell>
                  <Table.Cell>{d.current_grade}</Table.Cell>
                  <Table.Cell>{d.current_score}</Table.Cell>
                  <Table.Cell>
                    <Badge color={getEnrollmentStatusColor(d.enrollment_state)}>
                      {d.enrollment_state}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
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
        {sorted && (
          <CSVLink
            data={sorted}
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

function sort(data: EnrollmentResult[], by: SortBy) {
  const sorted = [...data];

  switch (by) {
    case 'account-asc':
      return sorted.sort((a, b) => a.account.localeCompare(b.account));
    case 'account-desc':
      return sorted.sort((a, b) => b.account.localeCompare(a.account));
    case 'course-asc':
      return sorted.sort((a, b) => a.course_name.localeCompare(b.course_name));
    case 'course-desc':
      return sorted.sort((a, b) => b.course_name.localeCompare(a.course_name));
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
