import axios from "axios";
import type { User } from "./types";

export const CURRENT_USER_KEY = "taskflow.currentUser";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 20000
});

export function readStoredUser(): User | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const user = readStoredUser();
  if (user) {
    config.headers.set("X-User-Id", String(user.id));
  }
  return config;
});
