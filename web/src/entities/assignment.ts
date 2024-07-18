export interface UngradedAssignment {
  account: string;
  course_name: string;
  name: string;
  section: string;
  needs_grading_section: number;
  teachers: string;
  due_at: string;
  unlock_at: string;
  lock_at: string;
  published: boolean;
  gradebook_url: string;
}

export interface AssignmentResult {
  user_sis_id: string;
  name: string;
  account: string;
  course_name: string;
  section: string;
  title: string;
  points_possible: number | null;
  score: number | null;
  discrepancy: string;
  submitted_at: string;
  status: string;
  due_at: string;
  course_state: string;
  enrollment_role: string;
  enrollment_state: string;
}
