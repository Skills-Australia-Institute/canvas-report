/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
