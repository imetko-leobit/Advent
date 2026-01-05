import { createContext, useContext, ReactNode } from 'react';
import { User } from 'oidc-client-ts';
import { AuthMode } from './authConfig';

/**
 * Centralized Authentication State
 * 
 * This abstraction ensures that UI and routing logic depend only on this interface,
 * not on OIDC hooks directly. This allows the app to work identically in both
 * DEV mode (mock auth) and OIDC mode (real auth).
 */
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether authentication state is still being determined */
  isAuthLoading: boolean;
  
  /** The current authentication mode */
  authMode: AuthMode;
  
  /** The authenticated user (null if not authenticated) */
  user: User | null;
  
  /** Error during authentication (if any) */
  error?: Error;
  
  /** Sign in function (OIDC mode only) */
  signIn: (args?: { state?: unknown }) => Promise<void>;
  
  /** Sign out function */
  signOut: () => Promise<void>;
}

/**
 * Auth Context - provides centralized auth state to the entire app
 */
const AuthContext = createContext<AuthState | null>(null);

/**
 * AuthContext Provider Props
 */
export interface AuthContextProviderProps {
  children: ReactNode;
  value: AuthState;
}

/**
 * AuthContext Provider Component
 * 
 * Wraps the application and provides centralized auth state.
 * The actual value comes from either the real OIDC provider or mock provider.
 */
export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication state
 * 
 * This is the ONLY hook that components should use to access auth state.
 * It provides a consistent interface regardless of auth mode.
 * 
 * @throws {Error} If used outside of AuthContextProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with AuthProvider in main.tsx'
    );
  }
  
  return context;
}
