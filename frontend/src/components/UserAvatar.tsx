import type { User } from "../api/types";
import { initials } from "../utils";

export function UserAvatar({ user, size = "md" }: { user: User | null; size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm";
  const color = user?.avatar_color || "#3f6f55";

  return (
    <span
      className={`${dimensions} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white`}
      style={{ backgroundColor: color }}
      aria-label={user?.name ?? "Unassigned"}
      title={user?.name ?? "Unassigned"}
    >
      {user ? initials(user.name) : "U"}
    </span>
  );
}
