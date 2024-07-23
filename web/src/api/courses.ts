import { SupabaseClient } from '@supabase/supabase-js';
import { axios } from '../axios';
import { Course } from '../entities/courses';

export const getCoursesByAccountID = async (
  supabase: SupabaseClient,
  accountID: number
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios(`/accounts/${accountID}/courses`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data as Course[];
  } catch (err) {
    throw err as Error;
  }
};
