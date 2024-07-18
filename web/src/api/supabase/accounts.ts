import { SupabaseClient } from '@supabase/supabase-js';
import { Account } from '../../entities/supabase/account';

export const getAccounts = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase.schema('canvas').rpc('get_accounts');

    if (error) {
      throw Error(error.message);
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
      throw Error(accountQueryError.message);
    }

    const { data: courses, error: cousesQueryError } = await supabase
      .schema('canvas')
      .from('courses')
      .select(
        `id, name, course_code, workflow_state, account_id, grading_standard_id`
      )
      .eq('workflow_state', 'available')
      .eq('account_id', id);

    if (cousesQueryError) {
      throw Error(cousesQueryError.message);
    }

    return {
      ...account,
      courses: courses,
    } as Account;
  } catch (err) {
    throw err as Error;
  }
};
