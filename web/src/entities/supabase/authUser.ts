import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  app_role: string;
  avatar_url: string;
  created_at: string;
  last_sign_in_at: string;
}

export const getUserFromSession = (session: Session): AuthUser => {
  return {
    id: session.user.id,
    email: session.user.email || '',
    first_name: session.user.user_metadata['first_name'] || '',
    last_name: session.user.user_metadata['last_name'] || '',
    app_role: session.user.app_metadata['app_role'] || '',
    avatar_url: session.user.user_metadata['avatar_url'] || '',
    created_at: session.user.created_at,
    last_sign_in_at: session.user.last_sign_in_at || '',
  };
};
