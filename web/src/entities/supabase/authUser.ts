import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  app_role: string;
  avatar_url: string;
}

export const getUserFromSession = (session: Session): AuthUser => {
  return {
    id: session.user.id,
    email: session.user.email || '',
    first_name: session.user.user_metadata['first_name'] || '',
    last_name: session.user.user_metadata['last_name'] || '',
    app_role: session.user.user_metadata['app_role'] || '',
    avatar_url: session.user.user_metadata['avatar_url'] || '',
  };
};
