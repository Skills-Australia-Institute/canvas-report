import { Badge, Table, Text } from '@radix-ui/themes';
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

  if (data === undefined) {
    return <div></div>;
  }

  return (
    <div>
      <OutletHeader title="Accounts" subTitle="SMmsms amamms ma" />
      {displayedData && (
        <SearchBox<Account>
          data={data}
          filterKey="name"
          updateFiltered={(filteredData: Account[]) =>
            setDisplayedData(filteredData)
          }
        />
      )}
      <Table.Root variant="surface" className="mb-4 mt-4">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>State</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Courses</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {displayedData &&
            displayedData.map((a) => (
              <Table.Row key={a.id}>
                <Table.RowHeaderCell>
                  <Text className="font-medium hover:underline cursor-pointer">
                    <a href={`/accounts/${a.id}`}>{a.name}</a>
                  </Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Badge
                    color={a.workflow_state === 'active' ? 'green' : 'orange'}
                  >
                    {a.workflow_state}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{a.courses_count}</Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

// interface IPaginationProps {
//   count: number;
// }

// function Pagination({ count }: IPaginationProps) {
//   const numbers = Array.from({ length: count }, (_, index) => index + 1);
//   const isMoreThanFive = numbers.length > 5;

//   return (
//     <div className="flex items-center justify-center gap-6">
//       <div className="border-2 rounded p-2">
//         <ArrowLeftIcon className="opacity-25" fontSize="16px" />
//       </div>
//       <div className="flex items-center gap-4">
//         {isMoreThanFive ? (
//           <></>
//         ) : (
//           <>
//             {numbers.slice(0, 5).map((n) => (
//               <Text key={n} className="border-2 rounded px-2.5 py-1.5">
//                 {n}
//               </Text>
//             ))}
//           </>
//         )}
//       </div>

//       <div className="border-2 rounded p-2">
//         <ArrowRightIcon fontSize="16px" />
//       </div>
//     </div>
//   );
// }
