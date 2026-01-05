import { FC, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../router/index";
import PathsEnum from "../../router/PathEnum";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { ProgressSpinner } from "primereact/progressspinner";

interface LoginRedirectState {
  continueUri: string;
  extraQueryParams?: object;
}

/**
 * Login Page Component
 * 
 * Handles OIDC login flow:
 * 1. If not authenticated: Initiates OIDC signin redirect (once)
 * 2. After successful authentication: Redirects to intended destination
 * 
 * Uses a ref to track if signin has been initiated to prevent multiple redirects
 */
export const Login: FC = () => {
  const { signinRedirect, isLoading, error, user, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  
  // Track if we've already initiated signin to prevent multiple calls
  const hasInitiatedSignin = useRef(false);

  const returnUrl = new URLSearchParams(location.search).get("returnUrl");
  const userState = user?.state as LoginRedirectState;

  const continueUri = returnUrl !== PathsEnum.login && returnUrl;

  useEffect(() => {
    // If authenticated, navigate to the intended destination
    if (isAuthenticated && !isLoading) {
      window.history.replaceState({}, document.title, location.pathname);
      navigate(userState?.continueUri || routes.quest.path, { replace: true });
    } 
    // If not authenticated and not loading, initiate signin (but only once)
    else if (!isAuthenticated && !isLoading && !hasInitiatedSignin.current) {
      hasInitiatedSignin.current = true;
      const state: LoginRedirectState = {
        continueUri: continueUri || PathsEnum.quest,
      };
      signinRedirect({ state });
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    signinRedirect,
    userState?.continueUri,
    location.pathname,
    returnUrl,
  ]);

  if (isLoading)
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

  if (error) return <div>Oops... {error.message}</div>;

  if (!isLoading)
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
              onClick={() => signinRedirect()}
            />
          </div>
        </Panel>
      </div>
    );
};
