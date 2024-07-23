export interface Section {
  id: number;
  sis_section_id: string;
  name: string;
  start_at: string | null;
  end_at: string | null;
  course_id: number;
  total_students: number | null;
  created_at: string;
}
