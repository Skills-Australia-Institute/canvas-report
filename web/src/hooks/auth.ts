import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { User, getUserFromSession } from '../entities/user';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(url, key);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = user === null ? false : true;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setUser(null);
      } else {
        setUser(getUserFromSession(session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        setUser(getUserFromSession(session));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser: user,
    isLoggedIn: isLoggedIn,
  };
}

export function useSupabase() {
  return useMemo(() => supabase, []);
}
