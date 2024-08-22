import { useContext } from 'react';
import { SessionContext } from '../providers/session';
import { getUserFromSession } from '../supabase/authUsers';

export function useAuth() {
  const session = useContext(SessionContext);

  if (!session) {
    return {
      user: null,
      isLoggedIn: false,
    };
  }

  return {
    user: getUserFromSession(session),
    isLoggedIn: true,
  };
}
