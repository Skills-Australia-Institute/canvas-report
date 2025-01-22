import { Box, Tabs } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import UngradedAssignmentByCourse from '../components/reports/ungradedAssignmentByCourse';
import { ACTIONS, AppRole } from '../constants';
import { useAuth } from '../hooks/auth';
import { useSupabase } from '../hooks/supabase';
import { getCourseByID } from '../supabase/courses';

export default function Course() {
  const { courseID } = useParams();
  const { user } = useAuth();
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
      <OutletHeader title="Courses" subTitle={data?.name || undefined} />
      <Tabs.Root>
        <Tabs.List>
          {user?.app_role !== AppRole.StudentServices && (
            <Tabs.Trigger
              value={ACTIONS.UngradedAssignmentsByCourse.key}
              className="cursor-pointer"
            >
              {ACTIONS.UngradedAssignmentsByCourse.value}
            </Tabs.Trigger>
          )}
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value={ACTIONS.UngradedAssignmentsByCourse.key}>
            {data && data.name && data.account_name && (
              <UngradedAssignmentByCourse
                courseID={data.id}
                courseName={data.name}
                accountName={data.account_name}
              />
            )}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}
