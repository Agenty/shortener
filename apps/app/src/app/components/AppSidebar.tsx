import {
  Link2,
  BarChart3,
  FileText,
  Globe,
  Settings,
  LogOut,
  User,
  Key,
  Users,
  CreditCard,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { DOCS_URL } from "@/env";
import { useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";

const mainItems = [
  { title: "Links", url: "/links", icon: Link2 },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Domains", url: "/domains", icon: Globe },
];

const settingsSubItems = [
  { title: "Profile", url: "/settings", icon: User },
  { title: "API Keys", url: "/settings/api-keys", icon: Key },
  { title: "Users", url: "/users", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith("/settings") || location.pathname === "/users";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/links" className="flex items-center gap-2 font-bold text-lg">
          <Link2 className="h-6 w-6 text-primary" />
          {!collapsed && <span>shortener.dev</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Settings with submenu */}
              <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip="Settings"
                        className={`hover:bg-accent/50 ${isSettingsActive ? "bg-accent text-accent-foreground font-medium" : ""}`}
                      />
                    }
                  >
                    <Settings />
                    <span>Settings</span>
                    <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {settingsSubItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              render={
                                <NavLink
                                  to={sub.url}
                                  end
                                  className="hover:bg-accent/50"
                                  activeClassName="bg-accent text-accent-foreground font-medium"
                                />
                              }
                            >
                              <sub.icon />
                              <span>{sub.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billings"
              render={
                <NavLink
                  to="/billings"
                  end
                  className="hover:bg-accent/50"
                  activeClassName="bg-accent text-accent-foreground font-medium"
                />
              }
            >
              <CreditCard />
              <span>Billings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Docs"
              render={
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-accent/50"
                />
              }
            >
              <BookOpen />
              <span>Docs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start"
            nativeButton={false}
            render={<NavLink to="/login" />}
          >
            <LogOut />
            {!collapsed && <span>Logout</span>}
          </Button>
          {!collapsed && <ThemeToggle />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
