import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box, Button, ScrollArea, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import Callout from '../../components/callout';
import { AssignmentsResultsByUser } from '../../components/reports/assignmentsResultsByUser';
import { useDebounce } from '../../hooks/debounce';
import { useSupabase } from '../../hooks/supabase';
import { SupabaseUserContext } from '../../providers/supabaseUser';
import { getUsersBySearchTerm } from '../../supabase/users';

export default function StudentAssignmentsResultPage() {
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
        Student Assignments Result Report
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
        {isProgress && student && <AssignmentsResultsByUser user={student} />}
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
