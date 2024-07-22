import { Account } from './account';
import { Section } from './section';

export interface Course {
  id: number;
  name: string | null;
  course_code: string | null;
  account_id: number;
  workflow_state: string;
  grading_standard_id: number | null;
  account?: Account;
  sections?: Section[];
  account_name?: string;
}
