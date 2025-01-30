import { Semaphore } from 'async-mutex';
import { axios } from '../axios';
import { Course } from '../supabase/courses';

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
  signal: AbortSignal,
  userID: number
) => {
  try {
    const { data } = await axios.get(`/users/${userID}/enrollments-results`, {
      signal: signal,
    });

    return data as EnrollmentResult[];
  } catch (err) {
    throw err as Error;
  }
};

const getEnrollmentsResultsByCourseSemaphore = new Semaphore(10);

export const getEnrollmentsResultsByCourse = async (
  signal: AbortSignal,
  course: Course
) => {
  try {
    const data = await getEnrollmentsResultsByCourseSemaphore.runExclusive(
      async () => {
        if (!course.account_name) {
          return [];
        }

        const { data, status } = await axios.get(
          `/courses/${course.id}/enrollments-results`,
          {
            signal: signal,
            params: {
              course_name: course.name,
              course_workflow_state: course.workflow_state,
              account_name: course.account_name,
            },
          }
        );

        if (status !== 200) {
          throw new Error(
            `Error fetching enrollments result of course: ${course.id}`
          );
        }

        return data as EnrollmentResult[];
      }
    );

    return data;
  } catch (err) {
    throw err as Error;
  }
};
