import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { CanvasOAuth2 } from '../entities/canvas';

export const getCanvasOAuth2 = async (
  supabase: SupabaseClient,
  code: string,
  state: string
) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const { data } = await axios(`/oauth2`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        code: code,
        state: state,
      },
    });

    return data as CanvasOAuth2;
  } catch (err) {
    throw err as Error;
  }
};

export const getCanvasOAuth2Url = async (supabase: SupabaseClient) => {
  try {
    const accessToken = (await supabase.auth.getSession()).data.session
      ?.access_token;

    const {
      data: { url },
    } = await axios(`/oauth2/url`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return url as string;
  } catch (err) {
    throw err as Error;
  }
};
