import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Badge, ScrollArea, Table, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUsersBySearchTerm } from '../api/supabase/users';
import ErrorCallout from '../components/errorCallout';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import { useDebounce } from '../hooks/debounce';
import { useSupabase } from '../hooks/supabase';

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
        placeholder="Search…"
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
    enabled: searchTerm.length > 4,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorCallout
        msg={error.message}
        className="mt-4 max-w-lg
    "
      />
    );
  }
  return (
    <>
      {data && data.length > 0 && (
        <ScrollArea
          scrollbars="both"
          className="pr-4 mt-4"
          style={{ height: 600 }}
        >
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="text-xs">
                  Name
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Status
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  SIS ID
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Email
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-xs">
                  Integration
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((u) => (
                <Table.Row key={u.id}>
                  <Table.Cell className="text-xs">
                    <a
                      className="hover:underline cursor-pointer"
                      href={`/users/${u.id}`}
                    >
                      {u.name}
                    </a>
                  </Table.Cell>
                  <Table.Cell className="text-xs">
                    <Badge
                      color={
                        u.workflow_state == 'registered' ? 'green' : 'amber'
                      }
                    >
                      {u.workflow_state}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-xs">{u.sis_user_id}</Table.Cell>
                  <Table.Cell className="text-xs">{u.unique_id}</Table.Cell>
                  <Table.Cell className="text-xs">
                    {u.integration_id}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </ScrollArea>
      )}
    </>
  );
}