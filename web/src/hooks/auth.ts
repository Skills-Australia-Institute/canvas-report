import { useContext } from 'react';
import { getUserFromSession } from '../entities/user';
import { SessionContext } from '../providers/session';

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
