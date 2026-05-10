import { ChevronDown, KanbanSquare, LogOut, PieChart, Rows3, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "../../contexts/CurrentUser";
import { UserAvatar } from "../UserAvatar";
import { NotificationBell } from "../NotificationBell";

function navClass({ isActive }: { isActive: boolean }) {
  return `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-moss text-white shadow-sm" : "text-graphite hover:bg-stone-100 hover:text-ink"
  }`;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useCurrentUser();
  const navigate = useNavigate();
  const params = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeProjectId = useMemo(() => params.id ?? "1", [params.id]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function switchUser() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 rounded-md pr-2 text-ink">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
              <Workflow className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-normal">TaskFlow</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navClass} end>
              <Rows3 className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to={`/board/${activeProjectId}`} className={navClass}>
              <KanbanSquare className="h-4 w-4" />
              Board
            </NavLink>
            <NavLink to={`/analytics/${activeProjectId}`} className={navClass}>
              <PieChart className="h-4 w-4" />
              Analytics
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="flex min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-moss"
              >
                <UserAvatar user={currentUser} size="sm" />
                <span className="hidden max-w-[140px] truncate text-sm font-semibold text-ink sm:inline">Hi, {currentUser?.name}</span>
                <ChevronDown className="h-4 w-4 text-stone-500" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-40 mt-3 w-56 rounded-lg border border-stone-200 bg-white p-2 shadow-card">
                  <div className="border-b border-stone-100 px-2 py-2">
                    <p className="text-sm font-semibold text-ink">{currentUser?.name}</p>
                    <p className="truncate text-xs text-stone-500">{currentUser?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={switchUser}
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-semibold text-graphite transition hover:bg-stone-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Switch user / Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
