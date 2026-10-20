import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
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
import { ApiError, EMAIL_NOT_VERIFIED } from '@/lib/api';
import { DocumentTitle, type TitleKey } from '@/components/DocumentTitle';

type PageModule = { default: React.ComponentType };

/** Lazy route for a `page.tsx` in the app directory, `title` is a key of the `titles` messages */
const page = (load: () => Promise<PageModule>, title: TitleKey) => ({
  lazy: async () => {
    const { default: Component } = await load();
    return { Component, handle: { title } };
  },
});

export const router = createBrowserRouter([
  {
    element: (
      <NuqsAdapter>
        <DocumentTitle />
        <Outlet />
      </NuqsAdapter>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
        handle: { title: 'login' },
      },

      // auth
      { path: 'login', ...page(() => import('@/app/auth/login/page'), 'login') },
      { path: 'signup', ...page(() => import('@/app/auth/signup/page'), 'signup') },
      {
        path: 'reset-password',
        ...page(() => import('@/app/auth/reset-password/page'), 'resetPassword'),
      },
      {
        path: 'oauth/callback',
        ...page(() => import('@/app/auth/oauth-callback/page'), 'signingIn'),
      },
      {
        path: 'onboarding',
        ...page(() => import('@/app/auth/onboarding/page'), 'verifyEmail'),
      },

      // dashboard, shares the sidebar layout
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/links" replace /> },
          { path: 'links', ...page(() => import('@/app/links/page'), 'links') },
          {
            path: 'analytics',
            ...page(() => import('@/app/analytics/page'), 'analytics'),
          },
          { path: 'reports', ...page(() => import('@/app/reports/page'), 'reports') },
          { path: 'domains', ...page(() => import('@/app/domains/page'), 'domains') },
          { path: 'users', ...page(() => import('@/app/users/page'), 'users') },
          { path: 'billings', ...page(() => import('@/app/billings/page'), 'billing') },
          {
            path: 'settings',
            ...page(() => import('@/app/settings/page'), 'settings'),
          },
          {
            path: 'settings/api-keys',
            ...page(() => import('@/app/settings/api-keys/page'), 'apiKeys'),
          },
        ],
      },

      { path: '*', ...page(() => import('@/app/not-found'), 'notFound') },
    ],
  },
]);

/** Any API call made before the email is verified sends the user to onboarding */
const onApiError = (error: Error) => {
  if (
    error instanceof ApiError &&
    error.status === EMAIL_NOT_VERIFIED &&
    router.state.location.pathname !== '/onboarding'
  ) {
    router.navigate('/onboarding', { replace: true });
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onApiError }),
  mutationCache: new MutationCache({ onError: onApiError }),
  defaultOptions: {
    queries: {
      // Retrying won't help until the email is verified
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status === EMAIL_NOT_VERIFIED) &&
        failureCount < 3,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Sonner closeButton={true} richColors={true} />

        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
