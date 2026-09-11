import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

export function isVahtaRole(role: string | null | undefined) {
  return role?.toLowerCase().includes("vahta") ?? false;
}

export function isAppFullscreen(
  vahtaRole: boolean,
  browserFullscreen: boolean,
) {
  return vahtaRole || browserFullscreen;
}

export function useIsVahtaRole() {
  const { auth } = useContext(AuthContext);
  return isVahtaRole(auth.user?.role);
}
