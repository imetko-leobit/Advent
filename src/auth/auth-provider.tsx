import { AuthProvider as ReactOidcAuthProvider } from "react-oidc-context";
import {} from "oidc-client-ts";
import { oidcConfig } from "./config";
import { MockAuthProvider } from "./dev-auth-provider";

// DEV-ONLY: Conditional authentication provider
// When import.meta.env.DEV is true AND no real OIDC authority is configured,
// use MockAuthProvider to bypass authentication for local development
// Otherwise, use real OIDC authentication

const shouldUseMockAuth = () => {
  return import.meta.env.DEV && !import.meta.env.VITE_APP_AUTH_AUTHORITY;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (shouldUseMockAuth()) {
    console.log(
      "[DEV] Using MockAuthProvider - authentication bypassed for local development"
    );
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return <ReactOidcAuthProvider {...oidcConfig}>{children}</ReactOidcAuthProvider>;
};
