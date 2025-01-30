import { axios } from '../axios';
import { Account } from './accounts';
import { Section } from './sections';

export interface Course {
  id: number;
  course_code: string;
  name: string;
  sis_course_id: string;
  grading_standard_id: number | null;
  account_id: number;
  root_account_id: number;
  friendly_name: string;
  workflow_state: 'deleted' | 'claimed' | 'available';
  start_at: string;
  end_at: string;
  is_public: boolean;
  enrollment_term_id: number;
  account: Account;
  sections: Section[];
}

export const getCoursesByAccountID = async (
  signal: AbortSignal,
  accountID: number
) => {
  try {
    const { data } = await axios(`/accounts/${accountID}/courses`, {
      signal: signal,
    });

    return data as Course[];
  } catch (err) {
    throw err as Error;
  }
};
