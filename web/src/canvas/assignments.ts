import { SupabaseClient } from '@supabase/supabase-js';
import { Semaphore } from 'async-mutex';
import { axios } from '../axios';
import { Course } from './courses';

export interface UngradedAssignment {
  course_id: number;
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

export interface UngradedAssignmentWithAccountCourseInfo {
  account: string;
  course_name: string;
  course_id: number;
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

export interface UngradedAssignmentByUser {
  user_sis_id: string;
  name: string;
  account: string;
  course_name: string;
  section: string;
  title: string;
  points_possible: number | null;
  score: number | null;
  submitted_at: string;
  status: string;
  course_state: string;
  enrollment_role: string;
  enrollment_state: string;
  speedgrader_url: string;
}

// https://github.com/TanStack/query/discussions/4943
// Making only 10 API call is parallel

const ungradedAssignmentsByCourseIDSemaphore = new Semaphore(10);

export const getUngradedAssignmentsByCourseID = async (
  signal: AbortSignal,
  supabase: SupabaseClient,
  courseID: number,
  courseName: string,
  accountName: string
) => {
  try {
    const data = await ungradedAssignmentsByCourseIDSemaphore.runExclusive(
      async () => {
        const accessToken = (await supabase.auth.getSession()).data.session
          ?.access_token;

        const { data, status } = await axios(
          `/courses/${courseID}/ungraded-assignments`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: signal,
            params: {
              course_name: courseName,
              account_name: accountName,
            },
          }
        );

        if (status !== 200) {
          throw new Error(
            `Error fetching ungraded assignments of course: ${courseID}`
          );
        }

        return data as UngradedAssignmentWithAccountCourseInfo[];
      }
    );

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

export const getUngradedAssignmentsByUserID = async (
  signal: AbortSignal,
  supabase: SupabaseClient,
  userID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios.get(`/users/${userID}/ungraded-assignments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: signal,
    });

    return data as UngradedAssignmentByUser[];
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

    return data as UngradedAssignmentWithAccountCourseInfo[];
  } catch (err) {
    throw err as Error;
  }
};

const ungradedAssignmentsByCoursesSemaphore = new Semaphore(10);

export const getUngradedAssignmentsByCourses = async (
  signal: AbortSignal,
  supabase: SupabaseClient,
  courses: Course[],
  ids: string
) => {
  try {
    const data = await ungradedAssignmentsByCoursesSemaphore.runExclusive(
      async () => {
        const accessToken = (await supabase.auth.getSession()).data.session
          ?.access_token;

        const { data, status } = await axios<UngradedAssignment[]>(
          `/courses/ungraded-assignments`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              ids: ids,
            },
            signal: signal,
          }
        );

        if (status !== 200) {
          throw new Error(
            `Error fetching ungraded assignments of courses with ids: ${ids}}`
          );
        }

        return data.map((d) => {
          const course = courses.find((course) => course.id === d.course_id);
          return {
            ...d,
            account: course?.account.name,
            course_name: course?.name,
          } as UngradedAssignmentWithAccountCourseInfo;
        });
      }
    );

    return data;
  } catch (err) {
    throw err as Error;
  }
};
