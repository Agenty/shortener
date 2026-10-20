import { Outlet, useLocation } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GithubStarToast } from "@/components/GithubStarToast";
import { AppSidebar } from "./components/AppSidebar";

/** Pages that ask for a GitHub star */
const STAR_PATHS = ["/analytics", "/reports"];

export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b px-4 shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="mx-auto max-w-6xl w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {STAR_PATHS.includes(pathname) && (
        // Clear of the sidebar, which is fixed on the left from md up and narrows when collapsed
        <GithubStarToast className="transition-[left] md:left-[calc(var(--sidebar-width)+1rem)] md:group-has-data-[collapsible=icon]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)]" />
      )}
    </SidebarProvider>
  );
}
