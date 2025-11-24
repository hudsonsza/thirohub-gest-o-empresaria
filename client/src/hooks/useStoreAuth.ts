import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * Hook para autenticação de lojistas (nível 2)
 * Independente do OAuth Manus
 */
export function useStoreAuth() {
  const { data: storeOwner, isLoading, error } = trpc.storeAuth.me.useQuery();
  const logoutMutation = trpc.storeAuth.logout.useMutation();
  const [, setLocation] = useLocation();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/store/login");
  };

  return {
    storeOwner,
    isAuthenticated: !!storeOwner,
    isLoading,
    error,
    logout,
  };
}
