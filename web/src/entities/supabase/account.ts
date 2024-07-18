import { Course as CanvasCourse } from '../courses';
import { Course } from './course';

export interface Account {
  id: number;
  name: string;
  parent_account_id: number | null;
  workflow_state: string;
  courses_count?: number;
  courses?: Course[] | CanvasCourse[];
}
