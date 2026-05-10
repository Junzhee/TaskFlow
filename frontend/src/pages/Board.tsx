import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bot, CalendarDays, Check, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  acceptSubtask,
  createTask,
  decompose,
  fetchBoard,
  moveTask,
  rejectSubtask,
  updateTask
} from "../api/endpoints";
import type { Board as BoardData, BoardColumn, Subtask, Task, TaskPatch } from "../api/types";
import { UserAvatar } from "../components/UserAvatar";
import { formatDate, relativeTime, userById } from "../utils";

type DraftTask = {
  title: string;
  description: string;
  assignee_id: number | null;
  deadline: string;
  label: string;
};

const emptyDraft: DraftTask = {
  title: "",
  description: "",
  assignee_id: null,
  deadline: "",
  label: "General"
};

function columnTone(status: string): string {
  if (status === "todo") return "border-stone-300 bg-stone-50";
  if (status === "doing") return "border-amber/40 bg-amber/10";
  if (status === "review") return "border-moss/40 bg-moss/10";
  return "border-clay/30 bg-clay/10";
}

function toInputDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function taskPayload(draft: DraftTask): TaskPatch {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    assignee_id: draft.assignee_id,
    deadline: draft.deadline ? new Date(`${draft.deadline}T12:00:00`).toISOString() : null,
    label: draft.label.trim() || "General"
  };
}

function SortableTaskCard({ task, board, onOpen }: { task: Task; board: BoardData; onOpen: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", taskId: task.id, columnId: task.column_id }
  });
  const assignee = task.assignee ?? userById(board.members, task.assignee_id);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-task-card
      className={`rounded-lg border border-stone-200 bg-white p-3 shadow-sm transition hover:border-moss hover:shadow-card ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <button type="button" onClick={() => onOpen(task)} className="block w-full cursor-pointer text-left">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-ink">{task.title}</h3>
          <UserAvatar user={assignee} size="sm" />
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">{task.description || "No description yet."}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-paper px-2 py-1 text-xs font-semibold text-graphite">{task.label}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {relativeTime(task.deadline)}
          </span>
        </div>
      </button>
    </article>
  );
}

function KanbanColumnView({
  column,
  board,
  addingColumn,
  setAddingColumn,
  onCreate,
  onOpen
}: {
  column: BoardColumn;
  board: BoardData;
  addingColumn: number | null;
  setAddingColumn: (id: number | null) => void;
  onCreate: (columnId: number, title: string) => Promise<void>;
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}`, data: { type: "column", columnId: column.id } });
  const [title, setTitle] = useState("");

  async function save() {
    if (!title.trim()) return;
    await onCreate(column.id, title);
    setTitle("");
    setAddingColumn(null);
  }

  return (
    <section ref={setNodeRef} className={`flex min-h-[620px] flex-col rounded-lg border ${columnTone(column.status_key)} ${isOver ? "ring-2 ring-moss" : ""}`}>
      <div className="flex items-center justify-between border-b border-stone-200/70 px-3 py-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{column.name}</h2>
          <p className="text-xs font-medium text-stone-500">{column.tasks.length} tasks</p>
        </div>
        <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-graphite">{column.status_key}</span>
      </div>
      <SortableContext items={column.tasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div className="taskflow-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} board={board} onOpen={onOpen} />
          ))}
          {addingColumn === column.id ? (
            <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void save();
                  if (event.key === "Escape") setAddingColumn(null);
                }}
                placeholder="New task title"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => void save()} className="rounded-md bg-moss px-3 py-1.5 text-sm font-semibold text-white">
                  Add
                </button>
                <button type="button" onClick={() => setAddingColumn(null)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingColumn(column.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/60 px-3 py-3 text-sm font-semibold text-graphite transition hover:border-moss hover:text-moss"
            >
              <Plus className="h-4 w-4" />
              Add task
            </button>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function TaskModal({
  task,
  board,
  onClose,
  onSave
}: {
  task: Task | null;
  board: BoardData | null;
  onClose: () => void;
  onSave: (taskId: number, draft: DraftTask) => Promise<void>;
}) {
  const [draft, setDraft] = useState<DraftTask>(emptyDraft);

  useEffect(() => {
    if (task) {
      setDraft({
        title: task.title,
        description: task.description,
        assignee_id: task.assignee_id,
        deadline: toInputDate(task.deadline),
        label: task.label
      });
    }
  }, [task]);

  if (!task || !board) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Task detail</h2>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4">
          <label className="text-sm font-semibold text-graphite">
            Title
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm font-normal text-ink" />
          </label>
          <label className="text-sm font-semibold text-graphite">
            Description
            <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} className="mt-1 w-full resize-none rounded-md border border-stone-200 px-3 py-2 text-sm font-normal text-ink" />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold text-graphite">
              Assignee
              <select value={draft.assignee_id ?? ""} onChange={(event) => setDraft({ ...draft, assignee_id: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm font-normal text-ink">
                <option value="">Unassigned</option>
                {board.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-graphite">
              Deadline
              <input type="date" value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm font-normal text-ink" />
            </label>
            <label className="text-sm font-semibold text-graphite">
              Label
              <input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm font-normal text-ink" />
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-semibold text-graphite hover:bg-stone-100">
            Cancel
          </button>
          <button type="button" onClick={() => void onSave(task.id, draft)} className="rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AIDecomposePanel({
  open,
  projectId,
  onClose,
  onAccepted
}: {
  open: boolean;
  projectId: number;
  onClose: () => void;
  onAccepted: (task: Task) => void;
}) {
  const [description, setDescription] = useState("Build a complete user authentication page with email login and password reset");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [handled, setHandled] = useState<Record<number, "accepted" | "rejected">>({});

  async function run() {
    setLoading(true);
    setHandled({});
    try {
      const result = await decompose(projectId, description);
      setSubtasks(result.subtasks);
    } finally {
      setLoading(false);
    }
  }

  async function accept(item: Subtask) {
    setHandled((current) => ({ ...current, [item.id]: "accepted" }));
    const task = await acceptSubtask(item);
    onAccepted(task);
  }

  async function reject(item: Subtask) {
    setHandled((current) => ({ ...current, [item.id]: "rejected" }));
    await rejectSubtask(item);
  }

  return (
    <aside className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[460px] border-l border-stone-200 bg-white shadow-card transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-moss">
              <Sparkles className="h-4 w-4" />
              AI Decompose
            </p>
            <h2 className="mt-1 text-xl font-bold text-ink">Split a goal into tasks</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="taskflow-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-stone-200 px-3 py-3 text-sm leading-6"
          />
          <button type="button" onClick={() => void run()} disabled={loading || !description.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
            <Bot className="h-4 w-4" />
            Decompose
          </button>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          ) : null}
          <div className="space-y-3">
            {subtasks.map((item) => {
              const state = handled[item.id];
              return (
                <div key={item.id} className={`rounded-lg border p-4 transition ${state === "accepted" ? "border-moss bg-moss/10" : state === "rejected" ? "border-stone-200 bg-stone-50 opacity-60" : "border-stone-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-stone-600">{item.description}</p>
                    </div>
                    <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold text-graphite">{item.effort}</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-stone-500">Suggested: {item.suggested_assignee?.name ?? "Team"}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={Boolean(state)} onClick={() => void accept(item)} className="inline-flex items-center gap-1 rounded-md bg-moss px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button type="button" disabled={Boolean(state)} onClick={() => void reject(item)} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-50">
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Board() {
  const params = useParams();
  const projectId = Number(params.id ?? "1");
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingColumn, setAddingColumn] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBoard(String(projectId))
      .then((result) => {
        if (alive) setBoard(result);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const taskIndex = useMemo(() => {
    const map = new Map<number, Task>();
    board?.columns.forEach((column) => column.tasks.forEach((task) => map.set(task.id, task)));
    return map;
  }, [board]);

  function addTaskToBoard(task: Task) {
    setBoard((current) => {
      if (!current) return current;
      return {
        ...current,
        columns: current.columns.map((column) => (column.id === task.column_id ? { ...column, tasks: [...column.tasks, task] } : column))
      };
    });
  }

  async function handleCreate(columnId: number, title: string) {
    if (!board) return;
    const task = await createTask(board.project.id, { column_id: columnId, title, description: "", label: "General" });
    addTaskToBoard(task);
  }

  async function handleSave(taskId: number, draft: DraftTask) {
    const saved = await updateTask(taskId, taskPayload(draft));
    setBoard((current) => {
      if (!current) return current;
      return {
        ...current,
        columns: current.columns.map((column) => ({ ...column, tasks: column.tasks.map((task) => (task.id === saved.id ? saved : task)) }))
      };
    });
    setSelectedTask(saved);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!board || !activeId.startsWith("task-") || !overId) return;
    const taskId = Number(activeId.replace("task-", ""));
    const task = taskIndex.get(taskId);
    if (!task) return;

    const overTaskId = overId.startsWith("task-") ? Number(overId.replace("task-", "")) : null;
    const overTask = overTaskId ? taskIndex.get(overTaskId) : null;
    const targetColumnId = overId.startsWith("column-") ? Number(overId.replace("column-", "")) : overTask?.column_id;
    if (!targetColumnId) return;
    const targetColumn = board.columns.find((column) => column.id === targetColumnId);
    if (!targetColumn) return;
    const position = overTask ? Math.max(0, targetColumn.tasks.findIndex((item) => item.id === overTask.id)) : targetColumn.tasks.length;
    const previous = board;

    setBoard({
      ...board,
      columns: board.columns.map((column) => {
        const without = column.tasks.filter((item) => item.id !== task.id);
        if (column.id !== targetColumnId) return { ...column, tasks: without };
        const moved = { ...task, column_id: targetColumnId, position };
        const next = [...without];
        next.splice(Math.min(position, next.length), 0, moved);
        return { ...column, tasks: next.map((item, index) => ({ ...item, position: index })) };
      })
    });

    try {
      const saved = await moveTask(task.id, { column_id: targetColumnId, position });
      setBoard((current) =>
        current
          ? {
              ...current,
              columns: current.columns.map((column) => ({ ...column, tasks: column.tasks.map((item) => (item.id === saved.id ? saved : item)) }))
            }
          : current
      );
    } catch {
      setBoard(previous);
      setMessage("Move failed. The board was restored.");
    }
  }

  if (loading) {
    return <div className="h-[720px] animate-pulse rounded-lg bg-white shadow-card" />;
  }

  if (!board) {
    return <div className="rounded-lg border border-clay/30 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">Could not load board.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-moss">{formatDate(board.project.deadline)} deadline</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">{board.project.name}</h1>
        </div>
        <button type="button" onClick={() => setAiOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-graphite">
          <Sparkles className="h-4 w-4" />
          AI Decompose
        </button>
      </div>
      {message ? <div className="rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{message}</div> : null}
      <DndContext sensors={sensors} onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="grid gap-3 lg:grid-cols-4">
          {board.columns.map((column) => (
            <KanbanColumnView key={column.id} column={column} board={board} addingColumn={addingColumn} setAddingColumn={setAddingColumn} onCreate={handleCreate} onOpen={setSelectedTask} />
          ))}
        </div>
      </DndContext>
      <TaskModal task={selectedTask} board={board} onClose={() => setSelectedTask(null)} onSave={handleSave} />
      <AIDecomposePanel open={aiOpen} projectId={board.project.id} onClose={() => setAiOpen(false)} onAccepted={addTaskToBoard} />
    </div>
  );
}
