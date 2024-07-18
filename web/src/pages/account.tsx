import { Box, Tabs } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getAccountByID } from '../api/supabase/accounts';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import UngradedAssignments from '../components/reports/ungradedAssignments';
import { ACTIONS } from '../constants';
import { useSupabase } from '../hooks/supabase';

export default function Account() {
  const { accountID } = useParams();
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts', accountID],
    queryFn: () => {
      if (accountID) {
        return getAccountByID(supabase, Number(accountID));
      }
    },
    enabled: !!accountID,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{ title: 'Accounts', subtitle: data?.name }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Accounts" subTitle={data?.name} />
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Trigger value={ACTIONS.UngradedAssignments.key}>
            {ACTIONS.UngradedAssignments.value}
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value={ACTIONS.UngradedAssignments.key}>
            {data && <UngradedAssignments account={data} />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}
