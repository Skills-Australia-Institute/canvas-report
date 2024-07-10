import { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export const SessionContext = createContext<Session | null>(null);

export default function SessionProvider(props: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {props.children}
    </SessionContext.Provider>
  );
}
