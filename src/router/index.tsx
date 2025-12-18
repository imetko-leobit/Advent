import { Navigate, RouteObject, createBrowserRouter } from "react-router-dom";
import PathsEnum from "./PathEnum";
import { Login } from "../pages/login/login";
import { Quest } from "../pages/quest/quest";

export const routes = {
  root: {
    path: PathsEnum.main,
    element: <Navigate to={PathsEnum.quest} />,
  } satisfies RouteObject,

  login: {
    path: PathsEnum.login,
    element: <Login />,
  } satisfies RouteObject,

  quest: {
    path: PathsEnum.quest,
    element: <Quest />,
  } satisfies RouteObject,
} as const;

export const router = createBrowserRouter(Object.values(routes));
