import { FC, ReactNode, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useLocation } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import PathsEnum from "../../router/PathEnum";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Centralized authentication guard component
 * 
 * This component ensures:
 * 1. Auth state is fully loaded before making routing decisions
 * 2. Only one redirect happens per auth state change
 * 3. No redirect loops occur during OIDC initialization
 * 
 * Flow:
 * - While isLoading: Show loading spinner
 * - When loaded && not authenticated: Redirect to /login with returnUrl
 * - When loaded && authenticated: Render children
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to initialize before making any routing decisions
    // This prevents redirects during OIDC state resolution
    if (!isLoading && !isAuthenticated) {
      const currentPath = location.pathname;
      // Only redirect if we're not already on the login page
      if (currentPath !== PathsEnum.login) {
        navigate(
          PathsEnum.login + `?returnUrl=${encodeURIComponent(currentPath)}`,
          { replace: true } // Use replace to avoid adding to history
        );
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
