import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Badge, ScrollArea, Table, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Callout from '../components/callout';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import { useDebounce } from '../hooks/debounce';
import { useSupabase } from '../hooks/supabase';
import { getUsersBySearchTerm } from '../supabase/users';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
    debouncedSetSearchTerm(e.currentTarget.value);
  }

  return (
    <div className="w-full">
      <OutletHeader title="Users" />
      <TextField.Root
        placeholder="Enter name, email or SIS ID"
        onChange={handleChange}
        className="max-w-lg"
        value={inputValue}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      <UsersTable searchTerm={searchTerm} />
    </div>
  );
}

function UsersTable({ searchTerm }: { searchTerm: string }) {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', searchTerm, 'search-term'],
    queryFn: () => getUsersBySearchTerm(supabase, searchTerm),
  });
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Callout type="error" msg={error.message} className="mt-4 max-w-lg" />
    );
  }
  return (
    <>
      {data && data.length > 0 && (
        <ScrollArea
          type="auto"
          scrollbars="vertical"
          className="pr-4 mt-4"
          style={{ maxHeight: 600 }}
        >
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>SIS ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Integration</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((u) => (
                <Table.Row key={u.id}>
                  <Table.Cell>
                    <Text
                      className="hover:underline cursor-pointer"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      {u.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        u.workflow_state === 'registered'
                          ? 'green'
                          : u.workflow_state === 'pre_registered'
                          ? 'gray'
                          : 'amber'
                      }
                    >
                      {u.workflow_state}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{u.sis_user_id}</Table.Cell>
                  <Table.Cell>{u.unique_id}</Table.Cell>
                  <Table.Cell>{u.integration_id}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </ScrollArea>
      )}
    </>
  );
}
