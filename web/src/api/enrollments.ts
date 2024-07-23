import { SupabaseClient } from '@supabase/supabase-js';
import { axios } from '../axios';
import { EnrollmentResult } from '../entities/enrollment';

export const getEnrollmentsResultsByUserID = async (
  supabase: SupabaseClient,
  userID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios.get(`/users/${userID}/enrollments-results`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data as EnrollmentResult[];
  } catch (err) {
    throw err as Error;
  }
};
