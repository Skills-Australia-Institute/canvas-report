import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  ScrollArea,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useContext, useState } from 'react';
import { CSVLink } from 'react-csv';
import toast from 'react-hot-toast';
import { getUngradedAssignmentsByUserID } from '../../canvas/assignments';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import { useDebounce } from '../../hooks/debounce';
import { useSupabase } from '../../hooks/supabase';
import { SupabaseUserContext } from '../../providers/supabaseUser';
import { getUsersBySearchTerm, User } from '../../supabase/users';
import {
  getAssignmentStatusColor,
  getDateTimeString,
  getEnrollmentStatusColor,
  getFormattedName,
} from '../../utils';

export default function StudentUngradedAssignmentsPage() {
  const { user: student } = useContext(SupabaseUserContext);
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!student) {
      setErrMsg('Please select a student.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Student Ungraded Assignments Report
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 max-w-xl">
          <Text className="font-bold block mb-1" size="2">
            {student ? 'Selected student' : 'Search student'}
          </Text>
          <SearchAndSelectUser
            onChange={() => {
              setIsProgress(false);
            }}
          />
        </div>
        <div>
          <Button className="block cursor-pointer" type="submit">
            Submit
          </Button>
        </div>

        {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      </form>
      <div className="mt-2">
        {isProgress && student && <UngradedAssignmentsByUser user={student} />}
      </div>
    </div>
  );
}

function SearchAndSelectUser({ onChange }: { onChange: () => void }) {
  const { user: student, setUser: setStudent } =
    useContext(SupabaseUserContext);
  const [value, setValue] = useState(student ? student.name : '');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange();
    setValue(e.currentTarget.value);
    debouncedSetSearchTerm(e.currentTarget.value);
  };

  return (
    <div className="relative">
      {student ? (
        <TextField.Root
          placeholder="Enter student name, email or SIS ID"
          variant="soft"
          onChange={handleChange}
          value={student.name}
          disabled={true}
        >
          <TextField.Slot
            side="right"
            className="cursor-pointer"
            onClick={() => {
              onChange();
              setStudent(null);
            }}
          >
            <Cross1Icon height="16" width="16" fontWeight="bold" color="red" />
          </TextField.Slot>
        </TextField.Root>
      ) : (
        <div>
          <TextField.Root
            placeholder="Enter student name, email or SIS ID"
            variant="soft"
            onChange={handleChange}
            value={value}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <div className="absolute z-50 mt-2">
            <UserSelect searchTerm={searchTerm} />
          </div>
        </div>
      )}
    </div>
  );
}

interface UserSelectProps {
  searchTerm: string;
}

function UserSelect({ searchTerm }: UserSelectProps) {
  const supabase = useSupabase();
  const { setUser } = useContext(SupabaseUserContext);
  const { error, data } = useQuery({
    queryKey: ['users', searchTerm, 'search-term'],
    queryFn: async () => {
      if (searchTerm.length === 0) {
        return [];
      }
      return await getUsersBySearchTerm(supabase, searchTerm);
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
              {data.map((user) => (
                <Text
                  key={user.id + user.unique_id}
                  className="block p-2 rounded hover:bg-gray-200"
                  onClick={() => setUser(user)}
                >
                  {user.name + ' - ' + user.unique_id}
                </Text>
              ))}
            </Box>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

interface UngradedAssignmentsByUserProps {
  user: User;
}

export function UngradedAssignmentsByUser({
  user,
}: UngradedAssignmentsByUserProps) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', user.id, 'ungraded-assignments'],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getUngradedAssignmentsByUserID(signal, user.id),
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
                <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Section</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Submitted</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Enrollment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Speedgrader</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((d, i) => (
                <Table.Row
                  key={
                    d.course_name === 'Total'
                      ? i
                      : d.account + d.course_name + d.section + d.title
                  }
                >
                  <Table.Cell className="max-w-sm">{d.account}</Table.Cell>
                  <Table.Cell className="max-w-sm">
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.course_name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">{d.title}</Table.Cell>
                  <Table.Cell>{d.section}</Table.Cell>
                  <Table.Cell>
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.points_possible}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      className={d.course_name === 'Total' ? 'font-bold' : ''}
                    >
                      {d.score && Math.round(d.score * 100) / 100}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {d.course_name !== 'Total' && (
                      <Badge color={getAssignmentStatusColor(d.status)}>
                        {d.status}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">
                    {d.submitted_at !== '' &&
                      new Date(d.submitted_at).toLocaleString('en-AU')}
                  </Table.Cell>
                  <Table.Cell>
                    {d.course_name !== 'Total' && (
                      <Badge
                        color={getEnrollmentStatusColor(d.enrollment_state)}
                      >
                        {d.enrollment_state}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-sm">
                    <a
                      href={d.speedgrader_url}
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
          <CSVLink
            data={data}
            headers={headers}
            filename={`${name}-ungraded_assignments-${getDateTimeString()}`}
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

const headers = [
  {
    label: 'SIS ID',
    key: 'user_sis_id',
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
    label: 'Assignment',
    key: 'title',
  },
  {
    label: 'Points Possible',
    key: 'points_possible',
  },
  {
    label: 'Score',
    key: 'score',
  },
  {
    label: 'Submitted At',
    key: 'submitted_at',
  },
  {
    label: 'Status',
    key: 'status',
  },
  {
    label: 'Course State',
    key: 'course_state',
  },
  {
    label: 'Enrollment Role',
    key: 'enrollment_role',
  },
  {
    label: 'Enrollment State',
    key: 'enrollment_state',
  },
  {
    label: 'Speedgrader URL',
    key: 'speedgrader_url',
  },
];
