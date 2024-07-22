import { Account } from './account';
import { Section } from './section';

export interface Course {
  id: number;
  name: string | null;
  course_code: string | null;
  workflow_state: string;
  grading_standard_id: number | null;
  grading_standard: string | null;
  account?: Account;
  sections?: Section[];
  account_id: number;
  account_name?: string;
}
