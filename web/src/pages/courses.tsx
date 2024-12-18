import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Badge, ScrollArea, Table, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import { useDebounce } from '../hooks/debounce';
import { useSupabase } from '../hooks/supabase';
import { getCoursesBySearchTerm } from '../supabase/courses';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const debouncedSetSearchTerm = useDebounce(setSearchTerm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
    debouncedSetSearchTerm(e.currentTarget.value);
  }

  return (
    <div className="w-full">
      <OutletHeader title="Courses" />
      <TextField.Root
        placeholder="Enter course name or course code"
        onChange={handleChange}
        className="max-w-lg"
        value={inputValue}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      <CoursesTable searchTerm={searchTerm} />
    </div>
  );
}

function CoursesTable({ searchTerm }: { searchTerm: string }) {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['courses', searchTerm, 'search-term'],
    queryFn: () => getCoursesBySearchTerm(supabase, searchTerm),
  });
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{ title: 'Courses' }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
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
                <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Account status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((c) => (
                <Table.Row key={c.id}>
                  <Table.Cell>
                    <Text
                      className="hover:underline cursor-pointer"
                      onClick={() => navigate(`/courses/${c.id}`)}
                    >
                      {c.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        c.workflow_state === 'available' ? 'green' : 'gray'
                      }
                    >
                      {c.workflow_state}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      className="hover:underline cursor-pointer"
                      onClick={() => navigate(`/accounts/${c.account_id}`)}
                    >
                      {c.account_name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        c.account_workflow_state === 'active' ? 'green' : 'gray'
                      }
                    >
                      {c.account_workflow_state}
                    </Badge>
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
