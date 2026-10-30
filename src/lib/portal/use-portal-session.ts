import { useQuery } from "@tanstack/react-query";
import { getPortalSession } from "@/lib/portal/api";
import { useShopToken } from "@/lib/portal/shop-session";

export function usePortalSession() {
  const token = useShopToken();
  return useQuery({
    queryKey: ["portal-session", token],
    queryFn: () => getPortalSession({ data: token }),
    enabled: Boolean(token),
  });
}
