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
import { LogoMark, Wordmark } from "@/components/Logo";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";

const mainItems = [
  { key: "links", url: "/links", icon: Link2 },
  { key: "analytics", url: "/analytics", icon: BarChart3 },
  { key: "reports", url: "/reports", icon: FileText },
  { key: "domains", url: "/domains", icon: Globe },
] as const;

const settingsSubItems = [
  { key: "profile", url: "/settings", icon: User },
  { key: "apiKeys", url: "/settings/api-keys", icon: Key },
  { key: "users", url: "/users", icon: Users },
] as const;

export function AppSidebar() {
  const { t } = useI18n();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith("/settings") || location.pathname === "/users";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/links" aria-label="shortener.dev" className="flex items-center gap-2">
          <LogoMark className="size-7" />
          {!collapsed && <Wordmark />}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.menu}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    tooltip={t.nav[item.key]}
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
                    <span>{t.nav[item.key]}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Settings with submenu */}
              <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={t.nav.settings}
                        className={`hover:bg-accent/50 ${isSettingsActive ? "bg-accent text-accent-foreground font-medium" : ""}`}
                      />
                    }
                  >
                    <Settings />
                    <span>{t.nav.settings}</span>
                    <ChevronRight className="ms-auto transition-transform rtl:rotate-180 group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {settingsSubItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.key}>
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
                              <span>{t.nav[sub.key]}</span>
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
              tooltip={t.nav.billing}
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
              <span>{t.nav.billing}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t.nav.docs}
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
              <span>{t.nav.docs}</span>
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
            {!collapsed && <span>{t.nav.logout}</span>}
          </Button>
          {!collapsed && <LanguageSwitcher />}
          {!collapsed && <ThemeToggle />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
