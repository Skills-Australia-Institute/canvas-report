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
