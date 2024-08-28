export interface Section {
  id: number;
  name: string;
  course_code: number;
  start_at: Date | null;
  end_at: Date | null;
  workflow_state: 'active' | 'deleted';
  sis_source_id: string | null;
}
