import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CURRENT_USER_KEY, readStoredUser } from "../api/client";
import type { User } from "../api/types";

type CurrentUserContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => readStoredUser());

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUserState(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      logout
    }),
    [currentUser, logout, setCurrentUser]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const value = useContext(CurrentUserContext);
  if (!value) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider");
  }
  return value;
}
