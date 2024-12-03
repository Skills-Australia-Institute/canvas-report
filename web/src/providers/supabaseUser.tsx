import { createContext, PropsWithChildren, useState } from 'react';
import { User } from '../supabase/users';

export interface ISupabaseUserContext {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const SupabaseUserContext = createContext<ISupabaseUserContext>(
  {} as ISupabaseUserContext
);

export function SupabaseUserProvider(props: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <SupabaseUserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {props.children}
    </SupabaseUserContext.Provider>
  );
}
