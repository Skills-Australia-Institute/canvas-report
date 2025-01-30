import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Flex,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CSVLink } from 'react-csv';
import {
  getUngradedAssignmentsByCourseID,
  UngradedAssignmentWithAccountCourseInfo,
} from '../../canvas/assignments';
import { APP } from '../../constants';
import { getDateTimeString, getFormattedName } from '../../utils';
import Callout from '../callout';
import Loading from '../loading';

export default function UngradedAssignmentByCourse({
  courseID,
  courseName,
  accountName,
}: {
  courseID: number;
  courseName: string;
  accountName: string;
}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['courses', courseID, 'ungraded-assignments'],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getUngradedAssignmentsByCourseID(
        signal,
        courseID,
        courseName,
        accountName
      ),
  });

  if (isLoading) {
    return (
      <div className="mt-4">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Callout type="error" msg={error.message} className="max-w-lg"></Callout>
    );
  }

  return (
    <>
      {data && (
        <UngradedAssignmentsTable
          data={data}
          courseName={getFormattedName(courseName)}
        />
      )}
    </>
  );
}

interface UngradedAssignmentsTableProps {
  data: UngradedAssignmentWithAccountCourseInfo[];
  courseName: string;
}

type SortBy =
  | 'course-asc'
  | 'course-desc'
  | 'name-asc'
  | 'name-desc'
  | 'section-asc'
  | 'section-desc';

const UngradedAssignmentsTable = ({
  data,
  courseName,
}: UngradedAssignmentsTableProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('section-asc');

  const sorted = sort(data, sortBy);
  const perthData = sorted.filter(
    (d) =>
      !(
        d.section.includes('ADL') ||
        d.section.includes('Adl') ||
        d.section.includes('ADELAIDE') ||
        d.section.includes('Adelaide')
      )
  );
  const perthNeedsGrading = perthData.reduce(
    (acc, val) => acc + val.needs_grading_section,
    0
  );

  const adelaideData = sorted.filter(
    (d) =>
      d.section.includes('ADL') ||
      d.section.includes('Adl') ||
      d.section.includes('ADELAIDE') ||
      d.section.includes('Adelaide')
  );
  const adelaideNeedsGrading = adelaideData.reduce(
    (acc, val) => acc + val.needs_grading_section,
    0
  );

  const totalNeedsGrading = sorted.reduce(
    (acc, val) => acc + val.needs_grading_section,
    0
  );

  if (sorted.length === 0) {
    return (
      <Callout
        msg="No items to display"
        type={'success'}
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
        {sorted.length > 0 && (
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
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
                        <span>Assignment</span>

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
                <Table.ColumnHeaderCell>Needs grading</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Gradebook</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((a) => (
                <Table.Row key={a.account + a.course_name + a.section + a.name}>
                  <Table.Cell className="max-w-sm">{a.course_name}</Table.Cell>
                  <Table.Cell className="max-w-sm">{a.name}</Table.Cell>
                  <Table.Cell className="max-w-sm">{a.section}</Table.Cell>
                  <Table.Cell>{a.needs_grading_section}</Table.Cell>
                  <Table.Cell className="max-w-sm">
                    <div className="flex gap-2 flex-wrap">
                      {a.teachers.split(';').map((t, i) => (
                        <Badge key={t + i}>{t}</Badge>
                      ))}
                    </div>
                  </Table.Cell>
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
      <div className="pt-6">
        {APP === 'sai' && (
          <div className="flex justify-between">
            <div>
              <CSVLink
                data={perthData}
                headers={headers}
                filename={`PERTH_${courseName}_ungraded_assignments-${getDateTimeString()}`}
              >
                <Button className="cursor-pointer mr-4" color="teal">
                  Download Perth
                </Button>
              </CSVLink>
              <CSVLink
                data={adelaideData}
                headers={headers}
                filename={`ADL_${courseName}_ungraded_assignments-${getDateTimeString()}`}
              >
                <Button className="cursor-pointer" color="cyan">
                  Download Adelaide
                </Button>
              </CSVLink>
            </div>
            <div>
              <Text className="block font-bold mr-2" size="3">
                {`Total: ${totalNeedsGrading}`}
              </Text>
              <Text className="block font-bold mr-2" size="3">
                {`Perth: ${perthNeedsGrading}`}
              </Text>
              <Text className="block font-bold mr-2" size="3">
                {`Adelaide: ${adelaideNeedsGrading}`}
              </Text>
            </div>
          </div>
        )}
        {APP === 'stanley' && (
          <div className="flex justify-between">
            <CSVLink
              data={sorted}
              headers={headers}
              filename={`${courseName}_ungraded_assignments-${getDateTimeString()}`}
            >
              <Button className="cursor-pointer" color="cyan">
                Download
              </Button>
            </CSVLink>
            <Text className="block font-bold mr-2" size="3">
              {`Total: ${totalNeedsGrading}`}
            </Text>
          </div>
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
