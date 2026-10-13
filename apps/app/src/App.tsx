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
import AppLayout from '@/components/AppLayout';

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

      {
        path: 'login',
        lazy: async () => {
          const { default: Component } = await import('@/pages/auth/Login');

          return {
            Component,
            handle: { title: 'Login' },
          };
        },
      },
      {
        path: 'signup',
        lazy: async () => {
          const { default: Component } = await import('@/pages/auth/Signup');

          return {
            Component,
            handle: { title: 'Sign Up' },
          };
        },
      },
      {
        path: 'reset-password',
        lazy: async () => {
          const { default: Component } =
            await import('@/pages/auth/ResetPassword');

          return {
            Component,
            handle: { title: 'Reset Password' },
          };
        },
      },

      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/links" replace />,
          },
          {
            path: 'links',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Links');

              return {
                Component,
                handle: { title: 'Links' },
              };
            },
          },
          {
            path: 'analytics',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Analytics');

              return {
                Component,
                handle: { title: 'Analytics' },
              };
            },
          },
          {
            path: 'reports',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Reports');

              return {
                Component,
                handle: { title: 'Reports' },
              };
            },
          },
          {
            path: 'domains',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Domains');

              return {
                Component,
                handle: { title: 'Domains' },
              };
            },
          },
          {
            path: 'users',
            lazy: async () => {
              const { default: Component } = await import('@/pages/UsersPage');

              return {
                Component,
                handle: { title: 'Users' },
              };
            },
          },
          {
            path: 'billings',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Billings');

              return {
                Component,
                handle: { title: 'Billing' },
              };
            },
          },
          {
            path: 'settings',
            lazy: async () => {
              const { default: Component } = await import('@/pages/Settings');

              return {
                Component,
                handle: { title: 'Settings' },
              };
            },
          },
          {
            path: 'settings/api-keys',
            lazy: async () => {
              const { default: Component } =
                await import('@/pages/settings/ApiKeys');

              return {
                Component,
                handle: { title: 'API Keys' },
              };
            },
          },
        ],
      },

      {
        path: '*',
        lazy: async () => {
          const { default: Component } = await import('@/pages/NotFound');

          return {
            Component,
            handle: { title: 'Not Found' },
          };
        },
      },
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
