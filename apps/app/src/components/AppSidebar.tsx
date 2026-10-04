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
          {!collapsed && <span>idm.in</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent/50 flex items-center w-full"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Settings with submenu */}
              <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`hover:bg-accent/50 w-full justify-between ${isSettingsActive ? "bg-accent text-accent-foreground font-medium" : ""}`}
                    >
                      <span className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Settings</span>}
                      </span>
                      {!collapsed && (
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {settingsSubItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={sub.url}
                                end
                                className="hover:bg-accent/50"
                                activeClassName="bg-accent text-accent-foreground font-medium"
                              >
                                <sub.icon className="mr-2 h-3.5 w-3.5" />
                                <span>{sub.title}</span>
                              </NavLink>
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
            <SidebarMenuButton asChild>
              <NavLink
                to="/billings"
                end
                className="hover:bg-accent/50 flex items-center w-full"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {!collapsed && <span>Billings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://idm.in/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-accent/50 flex items-center w-full"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {!collapsed && <span>Docs</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
            <NavLink to="/login">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </NavLink>
          </Button>
          {!collapsed && <ThemeToggle />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
