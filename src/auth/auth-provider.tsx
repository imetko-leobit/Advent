import { ReactNode, useState, useEffect } from "react";
import { AuthProvider as ReactOidcAuthProvider, useAuth } from "react-oidc-context";
import { oidcConfig } from "./config";
import { MockAuthProvider } from "./dev-auth-provider";
import { AuthContextProvider, AuthState } from "./AuthContext";
import { getAuthConfig, AuthConfigError } from "./authConfig";

/**
 * Error Display Component
 * Shows configuration errors with helpful messaging
 */
const AuthConfigErrorDisplay: React.FC<{ error: AuthConfigError }> = ({ error }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      padding: "2rem",
      backgroundColor: "#f8f9fa",
    }}
  >
    <div
      style={{
        maxWidth: "600px",
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>
        ⚠️ Authentication Configuration Error
      </h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          fontSize: "0.9rem",
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "4px",
          marginTop: "1rem",
        }}
      >
        {error.message}
      </pre>
    </div>
  </div>
);

/**
 * OIDC Auth Context Adapter
 * Wraps react-oidc-context and adapts it to our AuthState interface
 */
const OidcAuthContextAdapter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const oidcAuth = useAuth();

  const authState: AuthState = {
    isAuthenticated: oidcAuth.isAuthenticated,
    isAuthLoading: oidcAuth.isLoading,
    authMode: 'oidc',
    user: oidcAuth.user ?? null,
    error: oidcAuth.error,
    signIn: async (args?: { state?: unknown }) => {
      await oidcAuth.signinRedirect(args);
    },
    signOut: async () => {
      await oidcAuth.signoutRedirect();
    },
  };

  return <AuthContextProvider value={authState}>{children}</AuthContextProvider>;
};

/**
 * Main Authentication Provider
 * 
 * Determines auth mode, validates configuration, and sets up the appropriate
 * authentication provider (DEV mock or OIDC).
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configError, setConfigError] = useState<AuthConfigError | null>(null);
  const [authConfig, setAuthConfig] = useState<ReturnType<typeof getAuthConfig> | null>(null);

  useEffect(() => {
    try {
      const config = getAuthConfig();
      setAuthConfig(config);
    } catch (error) {
      if (error instanceof AuthConfigError) {
        setConfigError(error);
      } else {
        throw error;
      }
    }
  }, []);

  // Show error screen if configuration is invalid
  if (configError) {
    return <AuthConfigErrorDisplay error={configError} />;
  }

  // Wait for config to load
  if (!authConfig) {
    return null;
  }

  // Use mock auth provider for DEV mode
  if (authConfig.mode === 'dev') {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // Use real OIDC provider for OIDC mode
  return (
    <ReactOidcAuthProvider {...oidcConfig}>
      <OidcAuthContextAdapter>{children}</OidcAuthContextAdapter>
    </ReactOidcAuthProvider>
  );
};
