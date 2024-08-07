import { SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from '../../entities/supabase/authUser';

export const getAuthUsers = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .select(
        'id, email, last_sign_in_at, created_at, phone, first_name, last_name, app_role'
      );

    if (error) {
      throw new Error(error.message);
    }

    return data as AuthUser[];
  } catch (err) {
    throw err as Error;
  }
};
