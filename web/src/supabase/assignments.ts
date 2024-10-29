import { SupabaseClient } from '@supabase/supabase-js';
import { getYearMonthDay } from '../utils';
import { rpc } from './supabase';

export interface Assignment {
  id: number;
  account_id: number;
  account_name: string;
  context_id: number;
  course_name: string;
  title: string;
  course_workflow_state: string;
  workflow_state: string;
  account_workflow_state: string;
  points_possible: number;
  due_at: string | null;
  unlock_at: string | null;
  lock_at: string | null;
  grading_type: string;
  assignment_group_id: number;
  grading_standard_id: number;
  context_type: string;
  created_at: string;
  updated_at: string;
  url: string;
  needs_grading?: number;
}

export const getAdditionalAttemptAssignments = async (
  supabase: SupabaseClient,
  updatedAfter: Date,
  searchTerms: string[]
) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .rpc(rpc.GetAdditionalAttemptAssignments, {
        updated_after: getYearMonthDay(updatedAfter),
        search_terms: searchTerms,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data as Assignment[];
  } catch (err) {
    throw err as Error;
  }
};
