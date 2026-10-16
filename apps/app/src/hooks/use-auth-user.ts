import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

/** Signed in user, `isAdmin` when the user has an admin level */
export function useAuthUser() {
  const { data: user, isLoading } = useQuery({
    // Keyed by token so a different sign in never reuses the cached user
    queryKey: ["auth-user", Cookies.get("token")],
    queryFn: () => api.profile.me(),
    staleTime: 5 * 60 * 1000,
  });

  return { user, isLoading, isAdmin: !!user?.level };
}
