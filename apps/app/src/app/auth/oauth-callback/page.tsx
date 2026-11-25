import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ApiError, EMAIL_NOT_VERIFIED, api } from "@/lib/api";
import { useI18n } from "@/i18n";

/** Landing page after Google consent, the API has already set the session cookies */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  // Keeps StrictMode from running the sign in twice
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!api.auth.isAuthenticated()) {
      toast.error(t.google.failed);
      navigate("/login", { replace: true });
      return;
    }

    api.profile
      .me()
      .then(() => {
        queryClient.removeQueries({ queryKey: ["auth-user"] });
        toast.success(t.common.loggedIn);
        navigate("/links", { replace: true });
      })
      .catch((err) => {
        // Existing password account that never verified its email
        if (err instanceof ApiError && err.status === EMAIL_NOT_VERIFIED) {
          navigate("/onboarding", { replace: true });
          return;
        }
        api.auth.logout();
        toast.error(err.message || t.google.failed);
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
