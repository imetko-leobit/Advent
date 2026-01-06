/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_MODE?: string;
  readonly VITE_APP_AUTH_AUTHORITY?: string;
  readonly VITE_APP_AUTH_REDIRECT_URI?: string;
  readonly VITE_GOOGLE_SHEET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
