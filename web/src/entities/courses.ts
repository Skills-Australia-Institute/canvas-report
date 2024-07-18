import { Account } from './account';
import { Section } from './section';

export interface Course {
  id: number;
  course_code: string;
  name: string;
  sis_course_id: string;
  grading_standard_id: number | null;
  account_id: number;
  root_account_id: number;
  friendly_name: string;
  workflow_state: string;
  start_at: string;
  end_at: string;
  is_public: boolean;
  enrollment_term_id: number;
  account: Account;
  sections: Section[];
}
