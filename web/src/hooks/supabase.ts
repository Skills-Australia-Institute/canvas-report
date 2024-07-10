import { useMemo } from 'react';
import { supabase } from '../supabase';

export function useSupabase() {
  return useMemo(() => supabase, []);
}
