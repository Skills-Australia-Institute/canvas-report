import { SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: number;
  name: string;
  workflow_state:
    | 'registered'
    | 'pre_registered'
    | 'creation_pending'
    | 'deleted';
  unique_id: string;
  sis_user_id: string;
  account_id: number;
  integration_id: string | null;
  sis_batch_id: number | null;
}

export const getUserByID = async (supabase: SupabaseClient, id: number) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .from('users')
      .select('id, name, workflow_state ')
      .eq('id', id)
      .eq('workflow_state', 'registered')
      .limit(1)
      .single();

    if (error) {
      throw new Error('user not found');
    }

    return data as User;
  } catch (err) {
    throw err as Error;
  }
};

export const getUsersBySearchTerm = async (
  supabase: SupabaseClient,
  searchTerm: string
) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .rpc('get_users_by_search_term', {
        search_term: searchTerm,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data as User[];
  } catch (err) {
    throw err as Error;
  }
};
