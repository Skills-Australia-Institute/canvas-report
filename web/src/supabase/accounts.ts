import { SupabaseClient } from '@supabase/supabase-js';

export interface Account {
  id: number;
  name: string;
  parent_account_id: number | null;
  workflow_state: string;
  courses_count?: number;
}

export const getAccounts = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase.schema('canvas').rpc('get_accounts');

    if (error) {
      throw new Error(error.message);
    }

    return data as Account[];
  } catch (err) {
    throw err as Error;
  }
};

export const getAccountByID = async (supabase: SupabaseClient, id: number) => {
  try {
    const { data, error } = await supabase
      .schema('canvas')
      .from('accounts')
      .select(
        `
        id, name, parent_account_id, workflow_state
      `
      )
      .eq('id', id)
      .limit(1)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Account;
  } catch (err) {
    throw err as Error;
  }
};
