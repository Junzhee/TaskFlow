export type User = {
  id: number;
  name: string;
  email: string;
  avatar_color: string;
  role?: string;
  skills?: string;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  deadline: string;
  owner_id?: number;
  created_at?: string;
  progress?: number;
  completed_tasks?: number;
  total_tasks?: number;
};

export type Task = {
  id: number;
  project_id: number;
  column_id: number;
  title: string;
  description: string;
  assignee_id: number | null;
  assignee?: User | null;
  deadline: string | null;
  label: string;
  position: number;
  created_at?: string;
  completed_at?: string | null;
};

export type BoardColumn = {
  id: number;
  project_id: number;
  name: string;
  status_key: "todo" | "doing" | "review" | "done" | string;
  position: number;
  tasks: Task[];
};

export type Board = {
  project: Project;
  members: User[];
  columns: BoardColumn[];
};

export type TaskPatch = Partial<{
  title: string;
  description: string;
  assignee_id: number | null;
  deadline: string | null;
  label: string;
}>;

export type Notification = {
  id: number;
  user_id: number;
  type: string;
  message: string;
  related_task_id?: number | null;
  is_read: boolean;
  created_at: string;
};

export type Subtask = {
  id: number;
  request_id?: number;
  title: string;
  description: string;
  effort: string;
  suggested_assignee_id: number | null;
  suggested_assignee?: User | null;
  review_status?: "pending" | "accepted" | "rejected" | string;
};

export type DecomposeResponse = {
  request_id?: number;
  subtasks: Subtask[];
};

export type Progress = {
  total: number;
  completed: number;
  percent: number;
};

export type BurndownPoint = {
  date: string;
  remaining: number;
  completed?: number;
};

export type MemberStat = {
  user_id: number;
  name: string;
  completed: number;
  total: number;
  percent: number;
};

export type WorkloadPoint = {
  user_id: number;
  name: string;
  value: number;
};

export type AnalyticsData = {
  progress: Progress;
  burndown: BurndownPoint[];
  member_stats: MemberStat[];
  workload: WorkloadPoint[];
};
