import { apiClient } from "./client";
import type {
  AnalyticsData,
  Board,
  BoardColumn,
  DecomposeResponse,
  Notification,
  Project,
  Subtask,
  Task,
  TaskPatch,
  User
} from "./types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (!isRecord(value)) {
    return [];
  }
  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  return [];
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function boolValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeUser(value: unknown): User {
  const record = isRecord(value) ? value : {};
  return {
    id: numberValue(record.id),
    name: stringValue(record.name, "Unknown"),
    email: stringValue(record.email),
    avatar_color: stringValue(record.avatar_color, "#3f6f55"),
    role: stringValue(record.role),
    skills: stringValue(record.skills)
  };
}

function normalizeProject(value: unknown): Project {
  const record = isRecord(value) ? value : {};
  return {
    id: numberValue(record.id),
    name: stringValue(record.name, "Untitled project"),
    description: stringValue(record.description),
    deadline: stringValue(record.deadline),
    owner_id: nullableNumber(record.owner_id) ?? undefined,
    created_at: stringValue(record.created_at) || undefined,
    progress: typeof record.progress === "number" ? record.progress : undefined,
    completed_tasks: typeof record.completed_tasks === "number" ? record.completed_tasks : undefined,
    total_tasks: typeof record.total_tasks === "number" ? record.total_tasks : undefined
  };
}

function normalizeTask(value: unknown): Task {
  const record = isRecord(value) ? value : {};
  const assignee = isRecord(record.assignee) ? normalizeUser(record.assignee) : null;
  return {
    id: numberValue(record.id),
    project_id: numberValue(record.project_id),
    column_id: numberValue(record.column_id),
    title: stringValue(record.title, "Untitled task"),
    description: stringValue(record.description),
    assignee_id: nullableNumber(record.assignee_id),
    assignee,
    deadline: stringValue(record.deadline) || null,
    label: stringValue(record.label, "General"),
    position: numberValue(record.position),
    created_at: stringValue(record.created_at) || undefined,
    completed_at: stringValue(record.completed_at) || null
  };
}

function normalizeColumn(value: unknown): BoardColumn {
  const record = isRecord(value) ? value : {};
  return {
    id: numberValue(record.id),
    project_id: numberValue(record.project_id),
    name: stringValue(record.name, "Column"),
    status_key: stringValue(record.status_key, "todo"),
    position: numberValue(record.position),
    tasks: getArray(record.tasks, ["tasks"]).map(normalizeTask)
  };
}

function normalizeNotification(value: unknown): Notification {
  const record = isRecord(value) ? value : {};
  return {
    id: numberValue(record.id),
    user_id: numberValue(record.user_id),
    type: stringValue(record.type, "INFO"),
    message: stringValue(record.message),
    related_task_id: nullableNumber(record.related_task_id),
    is_read: boolValue(record.is_read),
    created_at: stringValue(record.created_at)
  };
}

function normalizeSubtask(value: unknown): Subtask {
  const record = isRecord(value) ? value : {};
  const suggested = isRecord(record.suggested_assignee) ? normalizeUser(record.suggested_assignee) : null;
  return {
    id: numberValue(record.id),
    request_id: nullableNumber(record.request_id) ?? undefined,
    title: stringValue(record.title, "Suggested task"),
    description: stringValue(record.description),
    effort: stringValue(record.effort, "M"),
    suggested_assignee_id: nullableNumber(record.suggested_assignee_id),
    suggested_assignee: suggested,
    review_status: stringValue(record.review_status, "pending")
  };
}

function normalizeBoard(value: unknown): Board {
  const record = isRecord(value) ? value : {};
  const columns = getArray(record.columns ?? value, ["columns"]).map(normalizeColumn).sort((a, b) => a.position - b.position);
  return {
    project: normalizeProject(record.project),
    members: getArray(record.members, ["members", "users"]).map(normalizeUser),
    columns
  };
}

function normalizeAnalytics(value: unknown): AnalyticsData {
  const record = isRecord(value) ? value : {};
  const progressRecord = isRecord(record.progress) ? record.progress : {};
  return {
    progress: {
      total: numberValue(progressRecord.total),
      completed: numberValue(progressRecord.completed),
      percent: numberValue(progressRecord.percent)
    },
    burndown: getArray(record.burndown, ["burndown"]).map((point) => {
      const item = isRecord(point) ? point : {};
      return {
        date: stringValue(item.date),
        remaining: numberValue(item.remaining),
        completed: typeof item.completed === "number" ? item.completed : undefined
      };
    }),
    member_stats: getArray(record.member_stats, ["member_stats"]).map((point) => {
      const item = isRecord(point) ? point : {};
      return {
        user_id: numberValue(item.user_id),
        name: stringValue(item.name, "Member"),
        completed: numberValue(item.completed),
        total: numberValue(item.total),
        percent: numberValue(item.percent)
      };
    }),
    workload: getArray(record.workload, ["workload"]).map((point) => {
      const item = isRecord(point) ? point : {};
      return {
        user_id: numberValue(item.user_id),
        name: stringValue(item.name, "Member"),
        value: numberValue(item.value ?? item.total)
      };
    })
  };
}

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<unknown>("/api/users");
  return getArray(response.data, ["users", "items"]).map(normalizeUser);
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiClient.get<unknown>("/api/projects");
  return getArray(response.data, ["projects", "items"]).map(normalizeProject);
}

export async function fetchBoard(projectId: string): Promise<Board> {
  const response = await apiClient.get<unknown>(`/api/projects/${projectId}/board`);
  return normalizeBoard(response.data);
}

export async function createTask(projectId: number, payload: TaskPatch & { column_id: number }): Promise<Task> {
  const response = await apiClient.post<unknown>(`/api/projects/${projectId}/tasks`, payload);
  return normalizeTask(response.data);
}

export async function updateTask(taskId: number, payload: TaskPatch): Promise<Task> {
  const response = await apiClient.patch<unknown>(`/api/tasks/${taskId}`, payload);
  return normalizeTask(response.data);
}

export async function moveTask(taskId: number, payload: { column_id: number; position: number }): Promise<Task> {
  const response = await apiClient.patch<unknown>(`/api/tasks/${taskId}/move`, payload);
  return normalizeTask(response.data);
}

export async function decompose(projectId: number, description: string): Promise<DecomposeResponse> {
  const response = await apiClient.post<unknown>(`/api/projects/${projectId}/ai/decompose`, { description });
  const record = isRecord(response.data) ? response.data : {};
  return {
    request_id: nullableNumber(record.request_id) ?? undefined,
    subtasks: getArray(response.data, ["subtasks", "items"]).map(normalizeSubtask)
  };
}

export async function acceptSubtask(subtask: Subtask): Promise<Task> {
  const response = await apiClient.post<unknown>(`/api/ai/results/${subtask.id}/accept`, {
    subtask_id: subtask.id
  });
  return normalizeTask(response.data);
}

export async function rejectSubtask(subtask: Subtask): Promise<void> {
  await apiClient.post(`/api/ai/results/${subtask.id}/reject`, { subtask_id: subtask.id }).catch(() => undefined);
}

export async function fetchAnalytics(projectId: string): Promise<AnalyticsData> {
  const response = await apiClient.get<unknown>(`/api/projects/${projectId}/analytics`);
  return normalizeAnalytics(response.data);
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<unknown>("/api/notifications");
  return getArray(response.data, ["notifications", "items"]).map(normalizeNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiClient.get<unknown>("/api/notifications/unread-count");
  if (typeof response.data === "number") {
    return response.data;
  }
  if (isRecord(response.data)) {
    return numberValue(response.data.count ?? response.data.unread_count);
  }
  return 0;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/api/notifications/read-all");
}
