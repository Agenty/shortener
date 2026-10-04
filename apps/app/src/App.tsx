import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import { DocumentTitle } from "@/components/DocumentTitle";
import Links from "@/pages/Links";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Domains from "@/pages/Domains";
import UsersPage from "@/pages/UsersPage";
import Billings from "@/pages/Billings";
import Settings from "@/pages/Settings";
import ApiKeys from "@/pages/settings/ApiKeys";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DocumentTitle />
          <NuqsAdapter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/links" replace />} />
                <Route path="/links" element={<Links />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/billings" element={<Billings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/api-keys" element={<ApiKeys />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </NuqsAdapter>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
