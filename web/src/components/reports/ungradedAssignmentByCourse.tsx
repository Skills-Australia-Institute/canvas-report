import { useQuery } from '@tanstack/react-query';
import { getUngradedAssignmentsByCourseID } from '../../canvas/assignments';
import { useSupabase } from '../../hooks/supabase';
import Callout from '../callout';
import Loading from '../loading';

export default function UngradedAssignmentByCourse({
  courseID,
  courseName,
  accountName,
}: {
  courseID: number;
  courseName: string;
  accountName: string;
}) {
  const supabase = useSupabase();
  const { data, error, isLoading } = useQuery({
    queryKey: ['courses', courseID, 'ungraded-assignments'],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getUngradedAssignmentsByCourseID(
        signal,
        supabase,
        courseID,
        courseName,
        accountName
      ),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Callout type="error" msg={error.message}></Callout>;
  }

  return <>{data}</>;
}
