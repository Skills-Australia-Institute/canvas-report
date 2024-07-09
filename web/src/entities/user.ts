import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const getUserFromSession = (session: Session): User => {
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata['name'] as string,
    role: session.user.role || '',
  };
};
