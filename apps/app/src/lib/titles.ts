// Route → page title map. Add new routes here; no per-component changes needed.
export const routeTitles: Record<string, string> = {
  "/links": "Links",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/domains": "Domains",
  "/users": "Team Members",
  "/billings": "Billing & Plans",
  "/settings": "Settings",
  "/settings/api-keys": "API Keys",
  "/login": "Sign In",
  "/signup": "Sign Up",
  "/reset-password": "Reset Password",
};

export const APP_NAME = "idm.in";

export function getTitleForPath(pathname: string): string {
  const title = routeTitles[pathname];
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
