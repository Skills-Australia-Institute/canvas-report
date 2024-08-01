export interface CanvasOAuth2 {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
  };
  refresh_token: string;
  expires_in: number;
  canvas_region: string;
}
