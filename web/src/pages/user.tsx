import { Box, Tabs } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import { ACTIONS } from '../constants';
import { useSupabase } from '../hooks/supabase';
import { AssignmentsResultsByUser } from '../pages/reports/assignmentsResultsByUser';
import EnrollmentsResultsByUser from '../pages/reports/enrollmentsResultsByUser';
import { getUserByID } from '../supabase/users';

export default function User() {
  const { userID } = useParams();
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['users', userID],
    queryFn: () => {
      if (userID) {
        return getUserByID(supabase, Number(userID));
      }
    },
    enabled: !!userID,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{
          title: 'Users',
          subtitle: data?.name,
        }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Users" subTitle={data?.name} />
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Trigger
            value={ACTIONS.EnrollmentsResultsByUser.key}
            className="cursor-pointer"
          >
            {ACTIONS.EnrollmentsResultsByUser.value}
          </Tabs.Trigger>
          <Tabs.Trigger
            value={ACTIONS.AssignmentsResultsByUser.key}
            className="cursor-pointer"
          >
            {ACTIONS.AssignmentsResultsByUser.value}
          </Tabs.Trigger>
          <Tabs.Trigger
            value={ACTIONS.UngradedAssignmentsResultsByUser.key}
            className="cursor-pointer"
          >
            {ACTIONS.UngradedAssignmentsResultsByUser.value}
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value={ACTIONS.EnrollmentsResultsByUser.key}>
            {data && <EnrollmentsResultsByUser user={data} />}
          </Tabs.Content>
          <Tabs.Content value={ACTIONS.AssignmentsResultsByUser.key}>
            {data && <AssignmentsResultsByUser user={data} />}
          </Tabs.Content>
          <Tabs.Content value={ACTIONS.UngradedAssignmentsResultsByUser.key}>
            {data && <AssignmentsResultsByUser user={data} ungraded={true} />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}
