import { SupabaseClient } from '@supabase/supabase-js';
import { Account } from '../../entities/supabase/account';
import { getCoursesByAccountID } from '../courses';

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
    const { data: account, error: accountQueryError } = await supabase
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

    if (accountQueryError) {
      throw new Error(accountQueryError.message);
    }

    const courses = await getCoursesByAccountID(supabase, account.id);

    return {
      ...account,
      courses: courses,
    } as Account;
  } catch (err) {
    throw err as Error;
  }
};
