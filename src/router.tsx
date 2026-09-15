import { createBrowserRouter } from "react-router-dom";

import { Home, LoginPage } from "@/pages";
import { RootLayout } from "@/components/layout";

const Router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
    ],
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
]);

export default Router;
