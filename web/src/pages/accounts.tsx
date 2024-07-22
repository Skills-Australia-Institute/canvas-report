import { Badge, ScrollArea, Table } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getAccounts } from '../api/supabase/accounts';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import SearchBox from '../components/searchBox';
import { Account } from '../entities/supabase/account';
import { useSupabase } from '../hooks/supabase';

export default function Accounts() {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(supabase),
  });
  const [displayedData, setDisplayedData] = useState<Account[]>([]);

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
      {displayedData.length > 0 && (
        <>
          <SearchBox<Account>
            data={data ?? []}
            filterKey="name"
            updateFiltered={(filteredData: Account[]) =>
              setDisplayedData(filteredData)
            }
            className="max-w-lg"
          />
          <ScrollArea
            scrollbars="both"
            className="pr-4 mt-4"
            style={{ height: 600 }}
          >
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="text-xs">
                    Account
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="text-xs">
                    State
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="text-xs">
                    Total Courses
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {displayedData.map((a) => (
                  <Table.Row key={a.id}>
                    <Table.Cell className="text-xs">
                      <a
                        className="font-medium underline cursor-pointer"
                        href={`/accounts/${a.id}`}
                      >
                        {a.name}
                      </a>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <Badge
                        color={
                          a.workflow_state === 'active' ? 'green' : 'orange'
                        }
                      >
                        {a.workflow_state}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      {a.courses_count}
                    </Table.Cell>
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
