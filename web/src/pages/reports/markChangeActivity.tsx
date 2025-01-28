import {
  ArrowDownIcon,
  ArrowUpIcon,
  Cross1Icon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Code,
  Flex,
  Progress,
  ScrollArea,
  Separator,
  Spinner,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useQueries, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import customformat from 'dayjs/plugin/customParseFormat';
import { FormEvent, useContext, useState } from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';
import { getGradeChangeLogs, GradeChangeLog } from '../../canvas/gardes';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import { useDebounce } from '../../hooks/debounce';
import { useSupabase } from '../../hooks/supabase';
import { SupabaseUserContext } from '../../providers/supabaseUser';
import { getUsersBySearchTerm, User } from '../../supabase/users';

dayjs.extend(customformat);

export default function MarkChangeActivity() {
  const [dates, setDates] = useState<DateValueType>(null);
  const { user: grader } = useContext(SupabaseUserContext);
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!grader) {
      setErrMsg('Please select a grader.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Mark Change Activity Report
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-20 pr-10">
          <div className="mb-3 w-full">
            <Text className="font-bold block mb-1" size="2">
              Select date range
            </Text>
            <Datepicker
              inputClassName="w-full p-1 bg-indigo-50 cursor-pointer rounded"
              value={dates}
              onChange={(dates) => {
                setIsProgress(false);
                setDates(dates);
              }}
              showShortcuts={true}
              required={true}
            />
          </div>
          <div className="mb-3 w-full">
            <Text className="font-bold block mb-1 border-blue-900" size="2">
              {grader ? 'Selected grader' : 'Search grader'}
            </Text>
            <SearchAndSelect onChange={() => setIsProgress(false)} />
          </div>
        </div>
        <div>
          <Button className="block cursor-pointer" type="submit">
            Submit
          </Button>
        </div>

        {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      </form>
      {isProgress && grader && dates && dates.startDate && dates.endDate && (
        <GradeChangeLogsTable
          grader={grader}
          startTime={dates.startDate}
          endTime={dates.endDate}
        />
      )}
    </div>
  );
}

function SearchAndSelect({ onChange }: { onChange: () => void }) {
  const { user: grader, setUser: setGrader } = useContext(SupabaseUserContext);
  const [value, setValue] = useState(grader ? grader.name : '');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange();
    setValue(e.currentTarget.value);
    debouncedSetSearchTerm(e.currentTarget.value);
  };

  return (
    <div className="relative">
      {grader ? (
        <TextField.Root
          placeholder="Enter grader name or email"
          variant="soft"
          onChange={handleChange}
          value={grader.name}
          disabled={true}
        >
          <TextField.Slot
            side="right"
            className="cursor-pointer"
            onClick={() => {
              onChange();
              setGrader(null);
            }}
          >
            <Cross1Icon height="16" width="16" fontWeight="bold" color="red" />
          </TextField.Slot>
        </TextField.Root>
      ) : (
        <div>
          <TextField.Root
            placeholder="Enter grader name or email"
            variant="soft"
            onChange={handleChange}
            value={value}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <div className="absolute z-50 mt-2">
            <GraderSelect searchTerm={searchTerm} />
          </div>
        </div>
      )}
    </div>
  );
}

interface GraderSelectProps {
  searchTerm: string;
}

function GraderSelect({ searchTerm }: GraderSelectProps) {
  const supabase = useSupabase();
  const { setUser: setGrader } = useContext(SupabaseUserContext);
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', searchTerm, 'search-term'],
    queryFn: async () => {
      if (searchTerm.length === 0) {
        return [];
      }
      return await getUsersBySearchTerm(supabase, searchTerm);
    },
  });

  if (isLoading) {
    return <Spinner className="w-6 h-6" />;
  }

  if (error) {
    return (
      <Callout type="error" msg={error.message} className="mt-4 max-w-lg" />
    );
  }

  return (
    <div>
      {data && data.length > 0 && (
        <div className="max-w-lg border border-indigo-200 rounded p-2 cursor-pointer">
          <ScrollArea
            type="auto"
            scrollbars="vertical"
            style={{ maxHeight: 400 }}
          >
            <Box mr="4">
              {data.map((grader) => (
                <Text
                  key={grader.id + grader.unique_id}
                  className="block p-2 rounded hover:bg-gray-100"
                  onClick={() => setGrader(grader)}
                >
                  {grader.name + ' - ' + grader.unique_id}
                </Text>
              ))}
            </Box>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

interface IGradeChangeLogsProps {
  grader: User;
  startTime: Date;
  endTime: Date;
}

interface LogAggregateByCourse {
  course_id: number;
  course_name: string;
  unique_students: Set<string>;
  grade_changes: number;
  assignments: {
    [id: number]: {
      id: number;
      title: string;
      grade_changes: number;
    };
  };
}

interface LogAggregateByCourseRow {
  course_id: number;
  course_name: string;
  grade_changes: number;
  students: string[];
  assignments: { id: number; title: string; grade_changes: number }[];
}

type SortBy = 'course-asc' | 'course-desc' | 'date-desc' | 'date-asc';

function GradeChangeLogsTable({
  grader,
  startTime,
  endTime: et,
}: IGradeChangeLogsProps) {
  const endTime = new Date(et);
  endTime.setDate(endTime.getDate() + 1); // incremented end time to make it inclusive

  const supabase = useSupabase();
  const intervals = getWeekIntervals(startTime, endTime);
  const { result, isAllSuccess, errors, isLoading, successCount } = useQueries({
    queries: intervals.map(({ startTime, endTime }) => {
      return {
        queryKey: ['users', grader.id, 'grade-change-logs', startTime, endTime],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getGradeChangeLogs(signal, supabase, grader.id, startTime, endTime),
      };
    }),
    combine: (results) => {
      return {
        result: results.map((result) => (result.data ? result.data : [])),
        errors: results.map((result) => (result.error ? result.error : null)),
        isAllSuccess: results.every((result) => result.isSuccess),
        isLoading: results.some((result) => result.isLoading),
        successCount: results.reduce((total, result) => {
          if (result.isSuccess) {
            total++;
          }
          return total;
        }, 0),
      };
    },
  });

  const groupByDate = 'Group by date';
  const groupByCourse = 'Group by course';

  if (isLoading) {
    return (
      <>
        {intervals.length <= 1 ? (
          <Loading />
        ) : (
          <Progress
            value={(successCount / intervals.length) * 100}
            size="3"
            className="max-w-lg mt-6"
            color="green"
          />
        )}
      </>
    );
  }

  const errorsOnly = errors.filter((err) => err !== null);

  if (errorsOnly.length > 0) {
    return (
      <>
        {errorsOnly.map((error) => (
          <Callout type="error" msg={error.message} className="max-w-lg" />
        ))}
      </>
    );
  }

  const data = result.flat();

  if (isAllSuccess && data.length === 0) {
    return (
      <Callout
        type={'success'}
        msg={'No items found'}
        className="max-w-lg"
      ></Callout>
    );
  }

  const aggregated = aggregateGradeChangeLogsByDate(data);

  const totalStudents = aggregated.reduce((acc: Set<number>, row) => {
    row.unique_students.forEach((studentId) => acc.add(studentId));
    return acc;
  }, new Set<number>()).size;

  return (
    <div className="mt-4">
      <Flex gap="3">
        <Code
          className="font-bold"
          color="gray"
          highContrast
        >{`Total grades changed: ${data?.length}`}</Code>
        <Separator orientation="vertical" color="cyan" />
        <Code
          className="font-bold"
          color="gray"
          highContrast
        >{`Total unique students: ${totalStudents}`}</Code>
      </Flex>
      <Tabs.Root defaultValue={groupByDate}>
        <Tabs.List>
          <Tabs.Trigger value={groupByDate} className="cursor-pointer">
            {groupByDate}
          </Tabs.Trigger>
          <Tabs.Trigger value={groupByCourse} className="cursor-pointer">
            {groupByCourse}
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value={groupByDate}>
            <GradeChangeLogsByDateTable data={aggregated} />
          </Tabs.Content>
          <Tabs.Content value={groupByCourse}>
            <GradeChangeLogsByCourseTable data={data} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

function GradeChangeLogsByCourseTable({ data }: { data: GradeChangeLog[] }) {
  const [sortBy, setSortBy] = useState<SortBy>('course-asc');
  const sorted = sortCourses(aggregateGradeChangeLogsByCourse(data), sortBy);

  return (
    <ScrollArea
      type="auto"
      scrollbars="vertical"
      className="pr-4"
      style={{ maxHeight: 600 }}
    >
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
            <Table.ColumnHeaderCell>Assignments</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((c) => (
            <Table.Row key={c.course_id}>
              <Table.RowHeaderCell>
                <Text className="block">{c.course_name}</Text>
                <Text className="block mt-2">
                  {`Grades changed: `}
                  <span className="font-bold">{c.grade_changes}</span>
                </Text>
              </Table.RowHeaderCell>
              <Table.Cell>
                <div className="flex items-center">
                  {c.assignments.map((a) => (
                    <Code
                      key={a.id}
                      color="gray"
                      className="mr-2 mb-2 inline-block"
                    >
                      {`${a.title} - `}
                      <Text highContrast className="font-bold">
                        {a.grade_changes}
                      </Text>
                    </Code>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  );
}

function GradeChangeLogsByDateTable({
  data,
}: {
  data: LogAggregateByDateRow[];
}) {
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const sorted = sortDates(data, sortBy);

  return (
    <ScrollArea
      type="auto"
      scrollbars="vertical"
      className="pr-4"
      style={{ maxHeight: 600 }}
    >
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="min-w-28">
              <Tooltip
                content={`Click to sort by date ${
                  sortBy === 'date-asc'
                    ? 'descending'
                    : sortBy === 'date-desc'
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
                      if (sortBy === 'date-asc') {
                        setSortBy('date-desc');
                      } else if (sortBy === 'date-desc') {
                        setSortBy('date-asc');
                      } else {
                        setSortBy('date-desc');
                      }
                    }}
                  >
                    <span>Date</span>

                    {sortBy === 'date-asc' && (
                      <ArrowUpIcon className="cursor-pointer text-blue-500" />
                    )}

                    {sortBy === 'date-desc' && (
                      <ArrowDownIcon className="cursor-pointer text-blue-500" />
                    )}
                  </Flex>
                </div>
              </Tooltip>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Numbers</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Courses with assignments
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((d) => (
            <Table.Row key={d.date}>
              <Table.RowHeaderCell className="min-w-40">
                <Text className="block font-bold">{d.date}</Text>
                <Text className="block mt-2">
                  {`First: `}
                  <Code>
                    {dayjs(
                      dayjs(d.start_time, 'DD/MM/YYYY, h:mm:ss a').toDate()
                    ).format('h:mm a')}
                  </Code>
                </Text>
                <Text className="block mt-2">
                  {`Last: `}
                  <Code>
                    {dayjs(
                      dayjs(d.end_time, 'DD/MM/YYYY, h:mm:ss a').toDate()
                    ).format('h:mm a')}
                  </Code>
                </Text>
              </Table.RowHeaderCell>
              <Table.Cell className="min-w-40">
                <Text className="block">
                  {`Grades: `}
                  <span className="font-bold">{d.grade_changes}</span>
                </Text>
                <Text className="block mt-2">
                  {`Students: `}
                  <span className="font-bold">{d.unique_students.size}</span>
                </Text>
              </Table.Cell>
              <Table.Cell>
                <div>
                  {d.courses.map((c, i) => (
                    <div key={c.id} className="mb-2" color="gray">
                      <div>
                        <div>
                          <Text>{`${c.name} - `}</Text>
                          <Text className="font-bold" highContrast>
                            {c.grade_changes}
                          </Text>
                        </div>
                        <div>
                          {c.assignments.map((a) => (
                            <Code
                              key={a.id}
                              color="gray"
                              className="mr-2 mb-2 inline-block"
                            >
                              {`${a.title} - `}
                              <Text highContrast>{a.grade_changes}</Text>
                            </Code>
                          ))}
                        </div>
                        {i !== d.courses.length - 1 && (
                          <Separator className="w-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  );
}

function sortCourses(data: LogAggregateByCourseRow[], by: SortBy) {
  const sorted = [...data];

  switch (by) {
    case 'course-asc':
      return sorted.sort((a, b) => a.course_name.localeCompare(b.course_name));
    case 'course-desc':
      return sorted.sort((a, b) => b.course_name.localeCompare(a.course_name));
    default:
      return sorted;
  }
}

function sortDates(data: LogAggregateByDateRow[], by: SortBy) {
  const sorted = [...data];

  switch (by) {
    case 'date-asc':
      return sorted.sort(
        (a, b) =>
          dayjs(a.date, 'DD/MM/YYYY').toDate().getTime() -
          dayjs(b.date, 'DD/MM/YYYY').toDate().getTime()
      );
    case 'date-desc':
      return sorted.sort(
        (a, b) =>
          dayjs(b.date, 'DD/MM/YYYY').toDate().getTime() -
          dayjs(a.date, 'DD/MM/YYYY').toDate().getTime()
      );
    default:
      return sorted;
  }
}

function aggregateGradeChangeLogsByCourse(
  logs: GradeChangeLog[]
): LogAggregateByCourseRow[] {
  const courseMap: { [course_id: number]: LogAggregateByCourse } = {};

  logs.forEach((log) => {
    const {
      course_id,
      course_name,
      user_name,
      assignment_id,
      assignment_title,
    } = log;

    if (!courseMap[course_id]) {
      courseMap[course_id] = {
        course_name,
        course_id,
        grade_changes: 0,
        unique_students: new Set(),
        assignments: {},
      };
    }

    courseMap[course_id].unique_students.add(user_name);
    courseMap[course_id].grade_changes += 1;

    if (!courseMap[course_id].assignments[assignment_id]) {
      courseMap[course_id].assignments[assignment_id] = {
        id: assignment_id,
        title: assignment_title,
        grade_changes: 0,
      };
    }

    courseMap[course_id].assignments[assignment_id].grade_changes += 1;
  });

  return Object.values(courseMap).map((course) => ({
    course_id: course.course_id,
    course_name: course.course_name,
    grade_changes: course.grade_changes,
    students: [...course.unique_students],
    assignments: Object.values(course.assignments),
  }));
}

interface LogAggregateByDate {
  date: string;
  grade_changes: number;
  start_time: string;
  end_time: string;
  timestamps: string[];
  unique_students: Set<number>;
  courses: {
    [id: number]: {
      id: number;
      name: string;
      grade_changes: number;
      assignments: {
        [id: number]: {
          id: number;
          title: string;
          grade_changes: number;
        };
      };
    };
  };
}

interface LogAggregateByDateRow {
  date: string;
  grade_changes: number;
  start_time: string;
  end_time: string;
  timestamps: string[];
  unique_students: Set<number>;
  courses: {
    id: number;
    name: string;
    grade_changes: number;
    assignments: {
      id: number;
      title: string;
      grade_changes: number;
    }[];
  }[];
}

function aggregateGradeChangeLogsByDate(
  logs: GradeChangeLog[]
): LogAggregateByDateRow[] {
  const dateMap: { [date: string]: LogAggregateByDate } = {};

  logs.forEach((log) => {
    const {
      course_id,
      course_name,
      assignment_id,
      assignment_title,
      created_at,
      user_id,
    } = log;

    const createdAtLocale = new Date(created_at).toLocaleString('en-AU');
    const date = dayjs(createdAtLocale, 'DD/MM/YYYY, h:mm:ss a').toDate();
    const ymd = dayjs(date).format('DD/MM/YYYY');

    if (!dateMap[ymd]) {
      dateMap[ymd] = {
        date: ymd,
        start_time: '',
        end_time: '',
        timestamps: [],
        grade_changes: 0,
        courses: {},
        unique_students: new Set<number>(),
      };
    }

    dateMap[ymd].grade_changes += 1;

    dateMap[ymd].timestamps.push(createdAtLocale);

    dateMap[ymd].unique_students.add(user_id);

    if (!dateMap[ymd].courses[course_id]) {
      dateMap[ymd].courses[course_id] = {
        id: course_id,
        name: course_name,
        grade_changes: 0,
        assignments: {},
      };
    }

    dateMap[ymd].courses[course_id].grade_changes += 1;

    if (!dateMap[ymd].courses[course_id].assignments[assignment_id]) {
      dateMap[ymd].courses[course_id].assignments[assignment_id] = {
        id: assignment_id,
        title: assignment_title,
        grade_changes: 0,
      };
    }

    dateMap[ymd].courses[course_id].assignments[
      assignment_id
    ].grade_changes += 1;
  });

  return Object.values(dateMap).map((d) => {
    d.timestamps.sort(
      (a, b) =>
        dayjs(a, 'DD/MM/YYYY, h:mm:ss a').toDate().getTime() -
        dayjs(b, 'DD/MM/YYYY, h:mm:ss a').toDate().getTime()
    );

    return {
      date: d.date,
      start_time: d.timestamps[0],
      end_time: d.timestamps[d.timestamps.length - 1],
      timestamps: d.timestamps,
      grade_changes: d.grade_changes,
      unique_students: d.unique_students,
      courses: Object.values(d.courses).map((c) => ({
        id: c.id,
        name: c.name,
        grade_changes: c.grade_changes,
        assignments: Object.values(c.assignments),
      })),
    };
  });
}

function getWeekIntervals(
  startTime: Date,
  endTime: Date
): { startTime: Date; endTime: Date }[] {
  const intervals: { startTime: Date; endTime: Date }[] = [];
  const currentStartTime = new Date(startTime);

  while (currentStartTime <= endTime) {
    let currentEndTime = new Date(currentStartTime);

    currentEndTime.setDate(currentEndTime.getDate() + 6);

    if (currentEndTime > endTime) {
      currentEndTime = new Date(endTime);
    }

    intervals.push({
      startTime: new Date(currentStartTime),
      endTime: new Date(currentEndTime),
    });

    currentStartTime.setDate(currentStartTime.getDate() + 6);
  }

  return intervals;
}
