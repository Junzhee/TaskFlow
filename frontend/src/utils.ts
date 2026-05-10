import type { User } from "./api/types";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "No deadline";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) {
    return "unscheduled";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = date.getTime() - Date.now();
  const absDays = Math.round(Math.abs(diffMs) / 86_400_000);
  if (absDays === 0) {
    return diffMs >= 0 ? "today" : "today";
  }
  if (absDays === 1) {
    return diffMs >= 0 ? "tomorrow" : "yesterday";
  }
  return diffMs >= 0 ? `in ${absDays} days` : `${absDays} days ago`;
}

export function relativeTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  return `${Math.round(hours / 24)} days ago`;
}

export function userById(users: User[], id: number | null | undefined): User | null {
  if (!id) {
    return null;
  }
  return users.find((user) => user.id === id) ?? null;
}
