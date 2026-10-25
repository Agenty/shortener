import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Signed in user, `isAdmin` when the user has an admin level */
export function useAuthUser() {
  const { data: user, isLoading } = useQuery({
    // Keyed by token so a different sign in never reuses the cached user
    queryKey: ["auth-user", api.auth.getToken()],
    queryFn: () => api.profile.me(),
    staleTime: 5 * 60 * 1000,
  });

  return { user, isLoading, isAdmin: !!user?.level };
}
