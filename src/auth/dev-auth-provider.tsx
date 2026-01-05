import React, { ReactNode } from "react";
import { AuthContext, AuthContextProps } from "react-oidc-context";
import { User, UserManagerSettings, UserManagerEvents } from "oidc-client-ts";

// DEV-ONLY: Mock authentication context for local development
// This bypasses OIDC authentication when import.meta.env.DEV is true
// Remove or disable this when real OIDC access is available

// Create a mock user object that mimics OIDC User structure
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

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const mockUser = createMockUser();

  // Create a mock context that matches AuthContextProps interface
  const mockAuthContext: AuthContextProps = {
    // AuthState properties
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    activeNavigator: undefined,
    error: undefined,
    
    // UserManager settings and events - minimal mocks
    settings: {} as UserManagerSettings,
    events: {} as UserManagerEvents,
    
    // UserManager methods - all no-ops for dev mode
    clearStaleState: async () => {},
    removeUser: async () => {
      console.log("[DEV] Mock removeUser called");
    },
    signinPopup: async () => mockUser,
    signinSilent: async () => mockUser,
    signinRedirect: async () => {
      console.log("[DEV] Mock signinRedirect called");
    },
    signinResourceOwnerCredentials: async () => mockUser,
    signoutRedirect: async () => {
      console.log("[DEV] Mock signoutRedirect called");
    },
    signoutPopup: async () => {},
    signoutSilent: async () => {},
    querySessionStatus: async () => null,
    revokeTokens: async () => {},
    startSilentRenew: () => {},
    stopSilentRenew: () => {},
  };

  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};
