import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "./components/Layout/AppShell";
import { useCurrentUser } from "./contexts/CurrentUser";
import Analytics from "./pages/Analytics";
import Board from "./pages/Board";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser } = useCurrentUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireUser>
            <Dashboard />
          </RequireUser>
        }
      />
      <Route
        path="/board/:id"
        element={
          <RequireUser>
            <Board />
          </RequireUser>
        }
      />
      <Route
        path="/analytics/:id"
        element={
          <RequireUser>
            <Analytics />
          </RequireUser>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
