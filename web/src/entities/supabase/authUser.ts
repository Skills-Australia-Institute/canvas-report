import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  app_role: string | null;
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
