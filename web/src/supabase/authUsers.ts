import { Session, SupabaseClient } from '@supabase/supabase-js';
import { AppRole } from '../constants';

export interface AuthUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  app_role: AppRole | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export const getUserFromSession = (session: Session): AuthUser => {
  return {
    id: session.user.id,
    email: session.user.email || null,
    first_name: session.user.user_metadata['first_name'] || null,
    last_name: session.user.user_metadata['last_name'] || null,
    app_role: session.user.app_metadata['app_role'] || null,
    created_at: session.user.created_at,
    last_sign_in_at: session.user.last_sign_in_at || '',
  } as AuthUser;
};

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
