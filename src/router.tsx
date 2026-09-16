import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/components/layout";

const Router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Navigate replace to="/v2" />,
      },
      {
        path: "/v1",
        lazy: async () => ({ Component: (await import("@/pages/Home")).default }),
      },
      {
        path: "/v2",
        lazy: async () => ({ Component: (await import("@/pages/V2")).default }),
      },
    ],
  },
  {
    path: "/auth/login",
    lazy: async () => ({ Component: (await import("@/pages/Login")).default }),
  },
]);

export default Router;
