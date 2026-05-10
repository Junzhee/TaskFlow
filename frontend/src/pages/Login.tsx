import { ArrowRight, UsersRound, Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/endpoints";
import type { User } from "../api/types";
import { UserAvatar } from "../components/UserAvatar";
import { useCurrentUser } from "../contexts/CurrentUser";

type LocationState = {
  from?: string;
};

export default function Login() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, setCurrentUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    let alive = true;
    fetchUsers()
      .then((result) => {
        if (alive) {
          setUsers(result);
        }
      })
      .catch(() => {
        if (alive) {
          setError("Could not load demo users. Check that the backend is running.");
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  function pickUser(user: User) {
    setCurrentUser(user);
    navigate(state?.from ?? "/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
            <Workflow className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold tracking-normal">TaskFlow</p>
            <p className="text-sm font-medium text-stone-500">SC6105 demo workspace</p>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-moss shadow-sm">
              <UsersRound className="h-4 w-4" />
              Quick sign-in
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-normal text-ink md:text-5xl">
              Pick a seeded teammate to enter the project.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-stone-600">
              Alice, Bob, and Carol are preloaded with project work, tasks, analytics, and notifications for a clean demo path.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {loading
              ? [0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg bg-white shadow-card" />)
              : users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => pickUser(user)}
                    className="group flex min-h-56 flex-col items-start justify-between rounded-lg border border-stone-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-1 hover:border-moss"
                  >
                    <UserAvatar user={user} size="lg" />
                    <span className="w-full">
                      <span className="block text-xl font-bold text-ink">{user.name}</span>
                      <span className="mt-1 block truncate text-sm text-stone-500">{user.email}</span>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-moss">
                        Continue
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </span>
                  </button>
                ))}
          </div>
        </section>

        {error ? <div className="mt-6 rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm font-medium text-clay">{error}</div> : null}
      </div>
    </div>
  );
}
