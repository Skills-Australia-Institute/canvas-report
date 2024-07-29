import { Box, Tabs } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getCourseByID } from '../api/supabase/courses';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import { ACTIONS } from '../constants';
import { useSupabase } from '../hooks/supabase';

export default function Course() {
  const { courseID } = useParams();
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['courses', courseID],
    queryFn: () => {
      if (courseID) {
        return getCourseByID(supabase, Number(courseID));
      }
    },
    enabled: !!courseID,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{
          title: 'Courses',
          subtitle: data?.name || undefined,
        }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Accounts" subTitle={data?.name || undefined} />
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Trigger
            value={ACTIONS.UngradedAssignments.key}
            className="cursor-pointer"
          >
            {ACTIONS.UngradedAssignments.value}
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value={ACTIONS.UngradedAssignments.key}>
            {data && data.name}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}
