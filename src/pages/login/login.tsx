import { FC, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../router/index";
import PathsEnum from "../../router/PathEnum";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAuthContext } from "../../auth/AuthContext";

interface LoginRedirectState {
  continueUri: string;
  extraQueryParams?: object;
}

/**
 * Login Page Component
 * 
 * Handles authentication flow for both DEV and OIDC modes:
 * 1. If not authenticated: Shows login UI or initiates OIDC signin redirect (once)
 * 2. After successful authentication: Redirects to intended destination
 * 
 * Uses a ref to track if signin has been initiated to prevent multiple redirects.
 * 
 * Edge cases handled:
 * - Page refresh: Auth state is preserved and restored
 * - Direct navigation to /quest: Redirected to login, then back to /quest
 * - Logout → login flow: Clean state, ready for re-authentication
 */
export const Login: FC = () => {
  const { isAuthLoading, isAuthenticated, authMode, user, signIn, error } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track if we've already initiated signin to prevent multiple calls
  const hasInitiatedSignin = useRef(false);

  const returnUrl = new URLSearchParams(location.search).get("returnUrl");
  const userState = user?.state as LoginRedirectState;

  const continueUri = returnUrl !== PathsEnum.login && returnUrl;

  useEffect(() => {
    // Early return during loading to prevent any redirect logic from executing
    if (isAuthLoading) return;
    
    // If authenticated, navigate to the intended destination
    if (isAuthenticated) {
      // Clear the returnUrl from the URL
      window.history.replaceState({}, document.title, location.pathname);
      
      // Navigate to the intended destination
      // Precedence: userState?.continueUri (from OIDC) → continueUri (from URL) → default quest
      const destination = userState?.continueUri || continueUri || routes.quest.path;
      navigate(destination, { replace: true });
    } 
    // If not authenticated and in OIDC mode, initiate signin (but only once)
    else if (!isAuthenticated && authMode === 'oidc' && !hasInitiatedSignin.current) {
      hasInitiatedSignin.current = true;
      const state: LoginRedirectState = {
        continueUri: continueUri || PathsEnum.quest,
      };
      
      // Use the centralized signIn method
      signIn({ state }).catch((err) => {
        console.error("[Login] Sign in failed:", err);
        hasInitiatedSignin.current = false; // Allow retry
      });
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    authMode,
    navigate,
    signIn,
    userState?.continueUri,
    location.pathname,
    continueUri,
  ]);

  // Show loading spinner while auth state is being determined
  if (isAuthLoading) {
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

  // Show error if authentication failed
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Panel header="Authentication Error" className="w-2">
          <div className="flex flex-column align-items-center gap-3 p-3">
            <p style={{ color: "red" }}>Oops... {error.message}</p>
            <Button
              label="Try Again"
              onClick={() => {
                hasInitiatedSignin.current = false;
                window.location.reload();
              }}
            />
          </div>
        </Panel>
      </div>
    );
  }

  // In DEV mode, if we reach here and are authenticated, we'll be redirected by the useEffect
  // This is a fallback UI that should rarely be shown
  if (authMode === 'dev' && isAuthenticated) {
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

  // Show login button for OIDC mode (manual signin trigger)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Panel header="Login" className="w-2">
        <div className="flex flex-column align-items-center gap-3 p-3">
          <Button
            className="mr-4"
            label="Log in"
            type="submit"
            onClick={() => {
              hasInitiatedSignin.current = true;
              const state: LoginRedirectState = {
                continueUri: continueUri || PathsEnum.quest,
              };
              signIn({ state }).catch((err) => {
                console.error("[Login] Sign in failed:", err);
                hasInitiatedSignin.current = false;
              });
            }}
          />
        </div>
      </Panel>
    </div>
  );
};
