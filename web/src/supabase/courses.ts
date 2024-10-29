import { SupabaseClient } from '@supabase/supabase-js';
import { Section } from './section';

export interface Course {
  id: number;
  name: string | null;
  course_code: string | null;
  workflow_state: 'claimed' | 'available' | 'deleted';
  grading_standard_id: number | null;
  account_id: number;
  account_name?: string;
  account_workflow_state?: string;
  grading_standard?: string | null;
  sections?: Section[];
}

const isEmpty = (course: Course) => {
  return Object.values(course).every((value) => value === null);
};

export const getCoursesByAccountID = async (
  supabase: SupabaseClient,
  accountID: number
) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .from('courses')
      .select()
      .eq('account_id', accountID)
      .eq('workflow_state', 'available');

    if (error) {
      throw new Error(error.message);
    }

    return data as Course[];
  } catch (err) {
    throw err as Error;
  }
};

export const getCoursesBySearchTerm = async (
  supabase: SupabaseClient,
  searchTerm: string
) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .rpc('get_courses_by_search_term', {
        search_term: searchTerm,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data as Course[];
  } catch (err) {
    throw err as Error;
  }
};

export const getCourseByID = async (supabase: SupabaseClient, id: number) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .rpc('get_course_by_id', {
        course_id: id,
      });

    if (error) {
      throw new Error(error.message);
    }

    const course = data as Course;

    if (isEmpty(course)) {
      throw new Error('course not found');
    }

    return course;
  } catch (err) {
    throw err as Error;
  }
};
