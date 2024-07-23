import { SupabaseClient } from '@supabase/supabase-js';
import { Course } from '../../entities/supabase/course';

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
      throw Error(error.message);
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
      throw Error(error.message);
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
      throw Error(error.message);
    }

    return data as Course;
  } catch (err) {
    throw err as Error;
  }
};
