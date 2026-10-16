import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { ThemeProvider } from 'next-themes';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import DashboardLayout from '@/app/layout';

type PageModule = { default: React.ComponentType };

/** Lazy route for a `page.tsx` in the app directory */
const page = (load: () => Promise<PageModule>, title: string) => ({
  lazy: async () => {
    const { default: Component } = await load();
    return { Component, handle: { title } };
  },
});

export const router = createBrowserRouter([
  {
    element: (
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
        handle: { title: 'Login' },
      },

      // auth
      { path: 'login', ...page(() => import('@/app/auth/login/page'), 'Login') },
      { path: 'signup', ...page(() => import('@/app/auth/signup/page'), 'Sign Up') },
      {
        path: 'reset-password',
        ...page(() => import('@/app/auth/reset-password/page'), 'Reset Password'),
      },

      // dashboard, shares the sidebar layout
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/links" replace /> },
          { path: 'links', ...page(() => import('@/app/links/page'), 'Links') },
          {
            path: 'analytics',
            ...page(() => import('@/app/analytics/page'), 'Analytics'),
          },
          { path: 'reports', ...page(() => import('@/app/reports/page'), 'Reports') },
          { path: 'domains', ...page(() => import('@/app/domains/page'), 'Domains') },
          { path: 'users', ...page(() => import('@/app/users/page'), 'Users') },
          { path: 'billings', ...page(() => import('@/app/billings/page'), 'Billing') },
          {
            path: 'settings',
            ...page(() => import('@/app/settings/page'), 'Settings'),
          },
          {
            path: 'settings/api-keys',
            ...page(() => import('@/app/settings/api-keys/page'), 'API Keys'),
          },
        ],
      },

      { path: '*', ...page(() => import('@/app/not-found'), 'Not Found') },
    ],
  },
]);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Sonner />

        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
