import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
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
} from '@radix-ui/themes';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { CSVLink } from 'react-csv';
import toast from 'react-hot-toast';
import { getEnrollmentsResultsByCourse } from '../../canvas/enrollments';
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
  const supabase = useSupabase();
  const { result, isAllSuccess, successCount, errors } = useQueries({
    queries: courses.map((course) => {
      return {
        queryKey: ['courses', course.id, 'enrollments-results'],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getEnrollmentsResultsByCourse(signal, supabase, course),
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
              <Table.ColumnHeaderCell>SIS ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Section</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade link</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((d) => (
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
