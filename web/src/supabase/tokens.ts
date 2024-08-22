import { SupabaseClient } from '@supabase/supabase-js';

interface CanvasToken {
  id: number;
  access_token: string;
  refresh_token: string;
  created_at: string;
  updated_at: string;
}
export const getCanvasToken = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('id, access_token, refresh_token, created_at, updated_at')
      .limit(1)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as CanvasToken;
  } catch (err) {
    throw err as Error;
  }
};
