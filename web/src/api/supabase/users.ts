import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../entities/supabase/user';

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
      throw Error(error.message);
    }

    return data as User;
  } catch (err) {
    throw err as Error;
  }
};
