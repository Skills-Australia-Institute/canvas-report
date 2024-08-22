import { SupabaseClient } from '@supabase/supabase-js';
import { Semaphore } from 'async-mutex';
import { axios } from '../axios';

export interface UngradedAssignment {
  account: string;
  course_name: string;
  name: string;
  section: string;
  needs_grading_section: number;
  teachers: string;
  due_at: string;
  unlock_at: string;
  lock_at: string;
  published: boolean;
  gradebook_url: string;
}

export interface AssignmentResult {
  user_sis_id: string;
  name: string;
  account: string;
  course_name: string;
  section: string;
  title: string;
  points_possible: number | null;
  score: number | null;
  discrepancy: string;
  submitted_at: string;
  status: string;
  due_at: string;
  course_state: string;
  enrollment_role: string;
  enrollment_state: string;
}

// https://github.com/TanStack/query/discussions/4943
// Making only 10 API call is parallel

const ungradedAssignmentsSemaphore = new Semaphore(10);

export const getUngradedAssignmentsByCourseID = async (
  signal: AbortSignal,
  supabase: SupabaseClient,
  courseID: number
) => {
  try {
    const data = await ungradedAssignmentsSemaphore.runExclusive(async () => {
      const accessToken = (await supabase.auth.getSession()).data.session
        ?.access_token;

      const { data, status } = await axios(
        `/courses/${courseID}/ungraded-assignments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: signal,
        }
      );

      if (status !== 200) {
        throw new Error(
          `Error fetching ungraded assignments of course: ${courseID}`
        );
      }

      return data as UngradedAssignment[];
    });

    return data;
  } catch (err) {
    throw err as Error;
  }
};

export const getAssignmentsResultsByUserID = async (
  signal: AbortSignal,
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
      signal: signal,
    });

    return data as AssignmentResult[];
  } catch (err) {
    throw err as Error;
  }
};

export const getUngradedAssignmentsByAccountID = async (
  signal: AbortSignal,
  supabase: SupabaseClient,
  accountID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data, status } = await axios(
      `/accounts/${accountID}/ungraded-assignments`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: signal,
      }
    );

    if (status !== 200) {
      throw new Error(
        `Error fetching ungraded assignments of account: ${accountID}`
      );
    }

    return data as UngradedAssignment[];
  } catch (err) {
    throw err as Error;
  }
};
