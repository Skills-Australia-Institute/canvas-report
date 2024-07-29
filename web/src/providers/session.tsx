import { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import Loading from '../components/loading';
import { useSupabase } from '../hooks/supabase';

export const SessionContext = createContext<Session | null>(null);

export default function SessionProvider(props: PropsWithChildren) {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (loading) {
    return (
      <main className="flex flex-col h-screen">
        <Loading />
      </main>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      {props.children}
    </SessionContext.Provider>
  );
}
