export const APP_NAME = "Shortener.dev";

/** Formats a page title from the route's `handle.title` */
export function formatTitle(title?: string): string {
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
