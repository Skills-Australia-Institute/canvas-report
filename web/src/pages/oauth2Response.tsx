import { useQuery } from '@tanstack/react-query';
import { Navigate, useSearchParams } from 'react-router-dom';
import { getCanvasOAuth2 } from '../api/canvas';
import Callout from '../components/callout';
import Loading from '../components/loading';
import { useSupabase } from '../hooks/supabase';

export default function OAuth2Response() {
  const supabase = useSupabase();
  const [params] = useSearchParams();

  const code = params.get('code');
  const state = params.get('state');

  const { isLoading, error, data } = useQuery({
    queryKey: ['oauth2', state],
    queryFn: () => {
      if (code && state) {
        return getCanvasOAuth2(supabase, code, state);
      }
    },
    enabled: code !== null && state !== null,
  });

  console.log(data);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Callout type="error" msg={error.message} />;
  }

  return <Navigate to="/" />;
}
