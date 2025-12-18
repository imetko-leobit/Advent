import { FC, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../router/index.tsx";
import PathsEnum from "../../router/PathEnum.ts";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { ProgressSpinner } from "primereact/progressspinner";

interface LoginRedirectState {
  continueUri: string;
  extraQueryParams?: object;
}

export const Login: FC = () => {
  const { signinRedirect, isLoading, error, user, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const returnUrl = new URLSearchParams(location.search).get("returnUrl");
  const userState = user?.state as LoginRedirectState;

  const continueUri = returnUrl !== PathsEnum.login && returnUrl;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const state: LoginRedirectState = {
        continueUri: continueUri || PathsEnum.quest,
      };
      signinRedirect({ state });
    } else if (isAuthenticated && !isLoading) {
      window.history.replaceState({}, document.title, location.pathname);
      navigate(userState?.continueUri ?? routes.quest.path);
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    signinRedirect,
    userState?.continueUri,
    location.pathname,
    returnUrl,
    continueUri,
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
