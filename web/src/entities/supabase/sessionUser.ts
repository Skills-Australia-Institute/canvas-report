import { Session } from '@supabase/supabase-js';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const getUserFromSession = (session: Session): SessionUser => {
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata['name'] as string,
    role: session.user.role || '',
  };
};
