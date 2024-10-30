import { Badge, ScrollArea, Table, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import SearchBox from '../components/searchBox';
import { useSupabase } from '../hooks/supabase';
import { Account, getAccounts } from '../supabase/accounts';

export default function Accounts() {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(supabase),
  });
  const [displayedData, setDisplayedData] = useState<Account[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setDisplayedData(data);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{ title: 'Accounts' }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Accounts" />
      <SearchBox<Account>
        data={data ?? []}
        filterKey="name"
        updateFiltered={(filteredData: Account[]) =>
          setDisplayedData(filteredData)
        }
        className="max-w-lg"
        placeholder="Enter account name"
      />
      {displayedData.length > 0 && (
        <>
          <ScrollArea
            type="auto"
            scrollbars="vertical"
            className="pr-4 mt-4"
            style={{ maxHeight: 600 }}
          >
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Courses</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {displayedData.map((a) => (
                  <Table.Row key={a.id}>
                    <Table.Cell>
                      <Text
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate(`/accounts/${a.id}`)}
                      >
                        {a.name}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={
                          a.workflow_state === 'active' ? 'green' : 'orange'
                        }
                      >
                        {a.workflow_state}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{a.courses_count}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
