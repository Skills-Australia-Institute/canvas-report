import { Course } from '../courses';

export interface Account {
  id: number;
  name: string;
  parent_account_id: number | null;
  workflow_state: string;
  courses_count?: number;
  courses?: Course[];
}
