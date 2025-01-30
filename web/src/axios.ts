import a, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';
import { supabase } from './supabase/supabase';

export const axios = a.create({
  baseURL: API_BASE_URL,
});

axios.interceptors.request.use(async function (
  config: InternalAxiosRequestConfig
) {
  const accessToken = (await supabase.auth.getSession()).data.session
    ?.access_token;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  config.headers['Content-Type'] = 'application/json';

  return config;
});
