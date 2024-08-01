import { SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from '../../entities/supabase/authUser';

interface RawAuthUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  raw_user_meta_data: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  raw_app_meta_data: {
    app_role?: string;
  };
  created_at: string;
  last_sign_in_at: string;
}

export const getAuthUsers = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .select(
        'id, aud, role, email, raw_user_meta_data, created_at, last_sign_in_at, raw_app_meta_data'
      );

    if (error) {
      throw new Error(error.message);
    }

    const authUsers: AuthUser[] = data.map((u: RawAuthUser) => {
      return {
        id: u.id,
        email: u.email,
        first_name: u.raw_user_meta_data.first_name || '',
        last_name: u.raw_user_meta_data.last_name || '',
        avatar_url: u.raw_user_meta_data.avatar_url || '',
        app_role: u.raw_app_meta_data.app_role || '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    return authUsers;
  } catch (err) {
    throw err as Error;
  }
};
