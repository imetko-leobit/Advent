import { UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import { getAuthRedirectUri, getAuthority } from "../configUtils";

export const oidcConfig = {
  authority: getAuthority(),
  client_id: "leobit.quest.web",
  redirect_uri: getAuthRedirectUri(),
  scope: "quest openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: localStorage }),
  post_logout_redirect_uri: getAuthRedirectUri(),
} satisfies UserManagerSettings;
