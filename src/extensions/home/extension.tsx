import { LayoutDashboard } from "lucide-react";
import { Route } from "react-router";
import type { AppExtension } from "@/app/extension";
import { OverviewPage } from "./overview";
import { homeRoutes } from "./routes";

const homeExtension: AppExtension = {
  id: "home",
  priority: 0,
  resources: [
    {
      name: "home",
      list: homeRoutes.overview,
      meta: {
        label: "Overview",
        priority: 0,
        icon: <LayoutDashboard />,
        acl: false,
      },
    },
  ],
  routes: (
    <>
      <Route path="/overview" element={<OverviewPage />} />
    </>
  ),
};

export default homeExtension;
