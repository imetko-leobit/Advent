import React, { ReactNode } from "react";
import { User } from "oidc-client-ts";
import { AuthContextProvider, AuthState } from "./AuthContext";

// DEV-ONLY: Mock authentication context for local development
// This bypasses OIDC authentication when in DEV mode
// Remove or disable this when real OIDC access is available

/**
 * Create a mock user object that mimics OIDC User structure
 */
const createMockUser = (): User => {
  return {
    profile: {
      sub: "dev",
      email: "dev@leobit.com",
      name: "Dev User",
    },
    // Mock tokens with clear DEV prefixes to prevent confusion with real tokens
    id_token: "DEV_MOCK_ID_TOKEN",
    session_state: null,
    access_token: "DEV_MOCK_ACCESS_TOKEN",
    token_type: "Bearer",
    scope: "quest openid profile",
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    state: undefined,
  } as User;
};

/**
 * Mock Authentication Provider for DEV mode
 * 
 * Provides a mock authenticated state that works identically to OIDC mode
 * from the perspective of the rest of the application.
 */
export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mockUser = createMockUser();

  const authState: AuthState = {
    isAuthenticated: true,
    isAuthLoading: false,
    authMode: 'dev',
    user: mockUser,
    error: undefined,
    signIn: async () => {
      console.log("[DEV] Mock signIn called - already authenticated in DEV mode");
    },
    signOut: async () => {
      console.log("[DEV] Mock signOut called - reloading page");
      window.location.reload();
    },
  };

  return <AuthContextProvider value={authState}>{children}</AuthContextProvider>;
};
