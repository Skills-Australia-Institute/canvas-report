import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box, ScrollArea, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/debounce';
import { useSupabase } from '../hooks/supabase';
import { SupabaseUserContext } from '../providers/supabaseUser';
import { getUsersBySearchTerm } from '../supabase/users';

export default function SearchAndSelectUser({
  onChange,
}: {
  onChange?: () => void;
}) {
  const { user, setUser } = useContext(SupabaseUserContext);
  const [value, setValue] = useState(user ? user.name : '');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange();
    setValue(e.currentTarget.value);
    debouncedSetSearchTerm(e.currentTarget.value);
  };

  return (
    <div className="relative">
      <Text className="font-bold block mb-1" size="2">
        {user ? 'Selected user' : 'Search user'}
      </Text>
      {user ? (
        <TextField.Root
          placeholder="Enter user name, email or SIS ID"
          variant="soft"
          onChange={handleChange}
          value={user.name}
          disabled={true}
        >
          <TextField.Slot
            side="right"
            className="cursor-pointer"
            onClick={() => {
              onChange && onChange();
              setUser(null);
            }}
          >
            <Cross1Icon height="16" width="16" fontWeight="bold" color="red" />
          </TextField.Slot>
        </TextField.Root>
      ) : (
        <div>
          <TextField.Root
            placeholder="Enter user name, email or SIS ID"
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
