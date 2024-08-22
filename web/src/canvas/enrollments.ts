import { SupabaseClient } from '@supabase/supabase-js';
import { axios } from '../axios';

export interface EnrollmentResult {
  sis_id: string;
  name: string;
  account: string;
  course_name: string;
  section: string;
  enrollment_state: string;
  course_state: string;
  current_grade: string | null;
  current_score: number | null;
  enrollment_role: string;
  grades_url: string;
}

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
