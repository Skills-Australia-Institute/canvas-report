import { Button, Select, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getCoursesByAccountID } from '../../canvas/courses';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import UngradedAssignments from '../../components/reports/ungradedAssignments';
import { useSupabase } from '../../hooks/supabase';
import { Account, getAccounts } from '../../supabase/accounts';
import { supabase } from '../../supabase/supabase';

export default function UngradedAssignmentsByAccountPage() {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(supabase),
  });
  const [accountID, setAccountID] = useState<number>();
  const [isProgress, setIsProgress] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Callout
        type={'error'}
        msg={error.message}
        className="max-w-lg"
      ></Callout>
    );
  }

  const accountsMap = new Map(data?.map((d) => [d.id, d]));

  const account = accountID ? accountsMap.get(accountID) : undefined;

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Ungraded Assignments Report
      </Text>
      {data && (
        <div>
          <div>
            <Text className="font-bold mr-2" size="2">
              Select an account
            </Text>
            <Select.Root
              size="2"
              onValueChange={(val) => {
                setIsProgress(false);
                setAccountID(Number(val));
              }}
            >
              <Select.Trigger />
              <Select.Content>
                {data.map((d) => (
                  <Select.Item key={d.id} value={d.id.toString()}>
                    {d.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div>
            <Button
              type="button"
              mt="4"
              className="cursor-pointer"
              onClick={() => setIsProgress(true)}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
      <div className="mt-2">
        {account && isProgress && (
          <UngradedAssignmentsContainer account={account} />
        )}
      </div>
    </div>
  );
}

function UngradedAssignmentsContainer({ account }: { account: Account }) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts', account.id, 'courses'],
    queryFn: () => getCoursesByAccountID(supabase, account.id),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Callout
        type={'error'}
        msg={error.message}
        className="max-w-lg"
      ></Callout>
    );
  }

  return (
    <>{data && <UngradedAssignments account={account} courses={data} />}</>
  );
}
