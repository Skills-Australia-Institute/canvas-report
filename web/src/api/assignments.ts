import { SupabaseClient } from '@supabase/supabase-js';
import { axios } from '../axios';
import { AssignmentResult, UngradedAssignment } from '../entities/assignment';

export const getUngradedAssignmentsByCourseID = async (
  supabase: SupabaseClient,
  courseID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios(`/courses/${courseID}/ungraded-assignments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data as UngradedAssignment[];
  } catch (err) {
    throw err as Error;
  }
};

export const getAssignmentsResultsByUserID = async (
  supabase: SupabaseClient,
  userID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios.get(`/users/${userID}/assignments-results`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data as AssignmentResult[];
  } catch (err) {
    throw err as Error;
  }
};
