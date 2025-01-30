import {
  ArrowDownIcon,
  ArrowUpIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  Flex,
  Progress,
  ScrollArea,
  Table,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { CSVLink } from 'react-csv';
import toast from 'react-hot-toast';
import {
  EnrollmentResult,
  getEnrollmentsResultsByCourse,
} from '../../canvas/enrollments';
import Callout from '../../components/callout';
import { useDebounce } from '../../hooks/debounce';
import { useSupabase } from '../../hooks/supabase';
import { SupabaseCoursesContext } from '../../providers/supabaseCourses';
import { Course, getCoursesBySearchTerm } from '../../supabase/courses';
import { getDateTimeString } from '../../utils';

export default function EnrollmentsResultInCoursesPage() {
  const { courses } = useContext(SupabaseCoursesContext);
  const [isProgress, setIsProgress] = useState(false);

  const updateIsProgress = (val: boolean) => {
    setIsProgress(val);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Courses Enrollments Result Report
      </Text>
      <div>
        <Text className="font-bold block mb-1" size="2">
          Search courses
        </Text>
        <SearchAndMultiSelect
          isProgress={isProgress}
          updateIsProgress={updateIsProgress}
        />
      </div>
      <div className="mt-2">
        {isProgress && courses && courses.length !== 0 && (
          <EnrollmentsResultInCourses courses={courses} />
        )}
      </div>
    </div>
  );
}

function SearchAndMultiSelect({
  updateIsProgress,
  isProgress,
}: {
  isProgress: boolean;
  updateIsProgress: (val: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);
  const { courses, setCourses } = useContext(SupabaseCoursesContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    updateIsProgress(false);
    debouncedSetSearchTerm(e.currentTarget.value);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 max-w-xl">
        <TextField.Root
          placeholder="Enter course code or course name"
          variant="soft"
          onChange={handleChange}
          value={value}
          className="w-full"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => {
            updateIsProgress(true);
          }}
        >
          Submit
        </Button>
      </div>
      {courses && courses.length !== 0 && (
        <Flex mt="2" gap="2" wrap="wrap">
          {courses.map((c, i) => (
            <div key={c.id}>
              <Badge size="2">
                {c.name}
                <Cross2Icon
                  color="red"
                  className="cursor-pointer"
                  onClick={() => {
                    setCourses(courses.filter((_, index) => index !== i));
                  }}
                />
              </Badge>
            </div>
          ))}
        </Flex>
      )}
      <div className="absolute z-50 mt-2">
        {!isProgress && <CourseSelect searchTerm={searchTerm} />}
      </div>
    </div>
  );
}

interface CourseSelectProps {
  searchTerm: string;
}

function CourseSelect({ searchTerm }: CourseSelectProps) {
  const supabase = useSupabase();
  const { setCourses } = useContext(SupabaseCoursesContext);
  const { error, data } = useQuery({
    queryKey: ['courses', searchTerm, 'search-term'],
    queryFn: async () => {
      if (searchTerm.length === 0) {
        return [];
      }
      return await getCoursesBySearchTerm(supabase, searchTerm);
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return (
    <div>
      {data && data.length > 0 && (
        <div className="max-w-lg rounded p-2 cursor-pointer bg-gray-50">
          <ScrollArea
            type="auto"
            scrollbars="vertical"
            style={{ maxHeight: 400 }}
          >
            <Box mr="4">
              {data.map((course) => (
                <Text
                  key={course.id}
                  className="block p-2 rounded hover:bg-gray-200"
                  onClick={() => {
                    setCourses((prev) => {
                      if (prev === null || prev.length === 0) {
                        return [course];
                      } else {
                        const present = prev?.some((c) => c.id === course.id);
                        if (present) {
                          return prev;
                        } else {
                          return [...prev, course];
                        }
                      }
                    });
                  }}
                >
                  {course.name}
                </Text>
              ))}
            </Box>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function EnrollmentsResultInCourses({ courses }: { courses: Course[] }) {
  const [sortBy, setSortBy] = useState<SortBy>('section-asc');
  const { result, isAllSuccess, successCount, errors } = useQueries({
    queries: courses.map((course) => {
      return {
        queryKey: ['courses', course.id, 'enrollments-results'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getEnrollmentsResultsByCourse(signal, course),
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
  let sorted: EnrollmentResult[] = [];

  if (isAllSuccess) {
    sorted = sort(data, sortBy);
  } else {
    sorted = data;
  }

  return (
    <div>
      <ScrollArea
        type="auto"
        scrollbars="vertical"
        className="pr-4"
        style={{ maxHeight: 600 }}
      >
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <Tooltip
                  content={`Click to sort by SIS ID ${
                    sortBy === 'sis-asc'
                      ? 'descending'
                      : sortBy === 'sis-desc'
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
                        if (sortBy === 'sis-asc') {
                          setSortBy('sis-desc');
                        } else if (sortBy === 'sis-desc') {
                          setSortBy('sis-asc');
                        } else {
                          setSortBy('sis-asc');
                        }
                      }}
                    >
                      <span>SIS ID</span>

                      {sortBy === 'sis-asc' && (
                        <ArrowUpIcon className="cursor-pointer text-blue-500" />
                      )}

                      {sortBy === 'sis-desc' && (
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
                      gap="1"
                      align="center"
                      className="cursor-pointer"
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
                        <ArrowUpIcon className="cursor-pointer text-blue-500" />
                      )}

                      {sortBy === 'account-desc' && (
                        <ArrowDownIcon className="cursor-pointer text-blue-500" />
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
              <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade link</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((d) => (
              <Table.Row key={d.sis_id + d.course_name + d.section}>
                <Table.Cell className="max-w-sm">{d.sis_id}</Table.Cell>
                <Table.Cell className="max-w-sm">{d.name}</Table.Cell>
                <Table.Cell className="max-w-sm">{d.account}</Table.Cell>
                <Table.Cell className="max-w-sm">{d.course_name}</Table.Cell>
                <Table.Cell className="max-w-sm">{d.section}</Table.Cell>
                <Table.Cell className="max-w-sm">{d.current_grade}</Table.Cell>
                <Table.Cell className="max-w-sm">
                  <a href={d.grades_url} target="_blank" className="underline">
                    Link
                  </a>
                </Table.Cell>
                <Table.Cell className="max-w-sm">
                  <Badge
                    color={
                      d.enrollment_state === 'active'
                        ? 'green'
                        : d.enrollment_state === 'completed'
                        ? 'cyan'
                        : 'gray'
                    }
                  >
                    {d.enrollment_state}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </ScrollArea>
      <div className="pt-6">
        {!isAllSuccess && (
          <Progress
            value={(successCount / courses.length) * 100}
            size="3"
            className="max-w-3xl mt-4"
            color="green"
          />
        )}
        {isAllSuccess && (
          <CSVLink
            data={data}
            headers={headers}
            filename={`courses_enrollments_result-${getDateTimeString()}`}
          >
            <Button className="cursor-pointer" color="cyan">
              Download
            </Button>
          </CSVLink>
        )}
      </div>
    </div>
  );
}

type SortBy =
  | 'course-asc'
  | 'course-desc'
  | 'name-asc'
  | 'name-desc'
  | 'account-desc'
  | 'account-asc'
  | 'section-asc'
  | 'section-desc'
  | 'sis-asc'
  | 'sis-desc';

function sort(data: EnrollmentResult[], by: SortBy) {
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
    case 'account-asc':
      return sorted.sort((a, b) => a.account.localeCompare(b.account));
    case 'account-desc':
      return sorted.sort((a, b) => b.account.localeCompare(a.account));
    case 'sis-asc':
      return sorted.sort((a, b) => a.sis_id.localeCompare(b.sis_id));
    case 'sis-desc':
      return sorted.sort((a, b) => b.sis_id.localeCompare(a.sis_id));
    default:
      return sorted;
  }
}

const headers = [
  {
    label: 'SIS',
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
