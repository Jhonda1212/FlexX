import { UserAppShell } from "@/components/layout/UserAppShell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserAppShell>{children}</UserAppShell>;
}
