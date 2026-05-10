import { ArrowRight, CalendarDays, CheckCircle2, FolderKanban } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "../api/endpoints";
import type { Project } from "../api/types";
import { useCurrentUser } from "../contexts/CurrentUser";
import { formatDate } from "../utils";

function projectProgress(project: Project): number {
  if (typeof project.progress === "number") {
    return Math.round(project.progress);
  }
  if (project.total_tasks && typeof project.completed_tasks === "number") {
    return Math.round((project.completed_tasks / project.total_tasks) * 100);
  }
  return 25;
}

export default function Dashboard() {
  const { currentUser } = useCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchProjects()
      .then((result) => {
        if (alive) {
          setProjects(result);
        }
      })
      .catch(() => {
        if (alive) {
          setError("Could not load projects from the backend.");
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

  const primaryProject = useMemo(() => projects.find((project) => project.name.includes("SC6105")) ?? projects[0], [projects]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-moss">Project dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-ink">Hi, {currentUser?.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Track the current team project, open the board, and keep the SC6105 delivery path visible.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-stone-200 bg-white p-2 shadow-sm">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-stone-500">Projects</p>
            <p className="text-xl font-bold text-ink">{projects.length || "-"}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-stone-500">Primary</p>
            <p className="truncate text-xl font-bold text-ink">{primaryProject ? "SC6105" : "-"}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-stone-500">Owner</p>
            <p className="text-xl font-bold text-ink">Alice</p>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm font-medium text-clay">{error}</div> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {loading
          ? [0, 1].map((item) => <div key={item} className="h-72 animate-pulse rounded-lg bg-white shadow-card" />)
          : projects.map((project) => {
              const progress = projectProgress(project);
              return (
                <Link
                  key={project.id}
                  to={`/board/${project.id}`}
                  className="group block rounded-lg border border-stone-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-moss"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-moss/10 text-moss">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <h2 className="truncate text-2xl font-bold text-ink">{project.name}</h2>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-stone-600">{project.description}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-sm font-semibold text-graphite">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-[1fr_220px] md:items-end">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-graphite">Progress</span>
                        <span className="font-bold text-ink">{progress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-paper px-3 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                          <CalendarDays className="h-4 w-4" />
                          Deadline
                        </div>
                        <p className="mt-1 text-sm font-bold text-ink">{formatDate(project.deadline)}</p>
                      </div>
                      <div className="rounded-md bg-paper px-3 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                          <CheckCircle2 className="h-4 w-4" />
                          Done
                        </div>
                        <p className="mt-1 text-sm font-bold text-ink">
                          {project.completed_tasks ?? Math.round(progress / 10)} / {project.total_tasks ?? 12}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>

      {!loading && !projects.length ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">No projects assigned yet.</div>
      ) : null}
    </div>
  );
}
