import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getCanvasOAuth2Url } from '../api/canvas';
import { getCanvasToken } from '../api/supabase/tokens';
import { useSupabase } from '../hooks/supabase';
import Callout from './callout';
import Loading from './loading';

export default function Canvas() {
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['get-canvas-token'],
    queryFn: () => getCanvasToken(supabase),
  });

  const handleRefreshAccessToken = () => {};

  const handleAuthorizeInCanvasLMS = async () => {
    try {
      const url = await getCanvasOAuth2Url(supabase);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  // const url = `${CANVAS_BASE_URL}/login/oauth2/auth?client_id=${CANVAS_CLIENT_ID}&response_type=code&state=${nanoid()}&redirect_uri=${encodeURIComponent(
  //   CANVAS_OAUTH2_REDIRECT_URI
  // )}`;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Callout type="error" msg={error.message} />;
  }

  return (
    <div className="w-full">
      {data && (
        <>
          <div className="max-w-lg mt-4">
            <label>
              <Text className="font-bold" size="2">
                Access Token
              </Text>
              <TextField.Root
                placeholder="Search the docs…"
                value={data.access_token}
                type={showAccessToken ? 'text' : 'password'}
                className="mb-4"
                disabled
              >
                <TextField.Slot
                  onClick={() => setShowAccessToken(!showAccessToken)}
                  side="right"
                  className="cursor-pointer"
                >
                  {showAccessToken ? (
                    <EyeOpenIcon height="16" width="16" />
                  ) : (
                    <EyeNoneIcon height="16" width="16" />
                  )}
                </TextField.Slot>
              </TextField.Root>
            </label>
            <label>
              <Text className="font-bold" size="2">
                Refresh Token
              </Text>
              <TextField.Root
                placeholder="Search the docs…"
                value={data.refresh_token}
                type={showRefreshToken ? 'text' : 'password'}
                className="mb-4"
                disabled
              >
                <TextField.Slot
                  onClick={() => setShowRefreshToken(!showRefreshToken)}
                  side="right"
                  className="cursor-pointer"
                >
                  {showRefreshToken ? (
                    <EyeOpenIcon height="16" width="16" />
                  ) : (
                    <EyeNoneIcon height="16" width="16" />
                  )}
                </TextField.Slot>
              </TextField.Root>
            </label>
            <Button type="button" onClick={handleRefreshAccessToken}>
              Refresh access token
            </Button>
            <Button type="button" onClick={handleAuthorizeInCanvasLMS}>
              Authorize in Canvas LMS
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
