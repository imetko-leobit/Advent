import { AuthProvider as ReactOidcAuthProvider } from "react-oidc-context";
import {} from "oidc-client-ts";
import { oidcConfig } from "./config";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ReactOidcAuthProvider {...oidcConfig}>{children}</ReactOidcAuthProvider>;
