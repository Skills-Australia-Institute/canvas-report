import { Semaphore } from 'async-mutex';
import { axios } from '../axios';

export interface GradeChangeLog {
  id: string;
  event_type: string;
  grade_defore: string | null;
  grade_after: string | null;
  created_at: string;
  user_name: string;
  user_id: number;
  course_name: string;
  course_id: number;
  account_id: number;
  assignment_id: number;
  assignment_title: string;
}

const gradeChangeLogSemaphore = new Semaphore(10);

export const getGradeChangeLogs = async (
  signal: AbortSignal,
  graderID: number,
  startTime: Date,
  endTime: Date
) => {
  try {
    const data = await gradeChangeLogSemaphore.runExclusive(async () => {
      const { data, status } = await axios(
        `/users/${graderID}/grade-change-logs`,
        {
          signal: signal,
          params: {
            start_time: startTime.toDateString(),
            end_time: endTime.toDateString(),
          },
        }
      );

      if (status !== 200) {
        throw new Error(
          `Error fetching grade change logs of grader: ${graderID}}`
        );
      }

      return data as GradeChangeLog[];
    });

    return data;
  } catch (err) {
    throw err as Error;
  }
};
