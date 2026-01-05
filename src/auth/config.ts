import { UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import { getAuthRedirectUri, getAuthority } from "../configUtils";

// DEV-ONLY: Provide fallback values when environment variables are not set
// This prevents errors during local development without real OIDC
const authority = getAuthority() || "https://dev-mock-authority.local";
const redirectUri = getAuthRedirectUri() || "http://localhost:3000";

export const oidcConfig = {
  authority,
  client_id: "leobit.quest.web",
  redirect_uri: redirectUri,
  scope: "quest openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: localStorage }),
  post_logout_redirect_uri: redirectUri,
} satisfies UserManagerSettings;
