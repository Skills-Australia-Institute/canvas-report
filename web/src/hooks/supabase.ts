import { useMemo } from 'react';
import { supabase } from '../supabase/supabase';

export function useSupabase() {
  return useMemo(() => supabase, []);
}
