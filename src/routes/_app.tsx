import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Boot } from "@/components/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Boot />;
  if (!user) return <Navigate to="/login" />;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
