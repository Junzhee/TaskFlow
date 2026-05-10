# TaskFlow — Software Requirements Specification

**An AI-Powered Project Management Platform for Student Teams**
Version 1.0 | Group 2 | SC6105 Software Engineering, NTU | April 2026

---

## 1. Introduction

### 1.1 Purpose
This SRS describes functional and non-functional requirements for TaskFlow, an AI-powered web-based project management platform for NTU student teams. It serves as the basis for design, implementation, and testing.

TaskFlow addresses fragmented communication, manual progress tracking, uneven workload distribution, and missed deadlines in student team projects.

### 1.2 Document Conventions
- Requirements ID format: `REQ-XX-NNN` (e.g., `REQ-FR-001`, `REQ-NF-001`)
- `shall` = mandatory requirement; `must` = constraint/performance requirement
- Priority: High / Medium / Low
- Diagrams follow UML 2.0 notation

### 1.3 Intended Audience

| Audience | Suggested Sections |
|---|---|
| Instructor / Advisor | All |
| Development Team | §2, §3, §4, §5, Appendix A |
| UI/UX Designers | §3.1, §4 |
| QA / Testers | §4, §5 |

### 1.4 Product Scope
Core capabilities:
- Kanban-style task board with drag-and-drop
- AI-powered task decomposition (high-level → 3-5 subtasks)
- Notification system: email (SendGrid) + in-app (WebSocket)
- Data analytics: burndown chart, completion rate, workload distribution
- User authentication with role-based project access

Scoped for NTU teams of 4–6 members on semester-long projects. Not intended for enterprise use.

### 1.5 References
- IEEE Std 830-1998 SRS Recommended Practice
- SC6105 Course Project Requirements, NTU, 2026
- TaskFlow Project Proposal, Team Agile Five, March 2026
- The Scrum Guide, Scrum.org, 2020

---

## 2. Overall Description

### 2.1 Product Perspective
TaskFlow fills the gap between overly complex enterprise tools (Jira, Asana) and overly simple consumer tools (Trello). It uses a three-tier client-server architecture:

```mermaid
graph TB
    subgraph Client["Client Tier (Browser)"]
        React["React 18+ (TypeScript)\nAnt Design + react-beautiful-dnd"]
    end
    subgraph Server["Server Tier (AWS EC2)"]
        FastAPI["FastAPI (Python 3.10+)"]
        WS["WebSocket Server"]
        AI["AI Decomposition Service"]
    end
    subgraph Data["Data Tier"]
        PG["PostgreSQL 14+ (AWS RDS)"]
    end
    subgraph External["External Services"]
        LLM["OpenAI / Claude API"]
        SG["SendGrid Email API"]
    end

    React -- "HTTPS REST" --> FastAPI
    React -- "WebSocket" --> WS
    FastAPI --> PG
    FastAPI --> LLM
    FastAPI --> SG
    WS --> FastAPI
```

### 2.2 Product Functions

| Module | Description |
|---|---|
| User Authentication | Email-based registration/login; JWT auth; password reset via email |
| Project Management | Create/edit/delete projects; invite members via email; role-based access (Owner, Member) |
| Kanban Board | Multi-column board with drag-and-drop; task cards with title, description, labels, deadline, assignee; filter and search |
| AI Assistant | Accepts high-level description → generates 3–5 subtasks with effort estimates and assignment suggestions via LLM API |
| Notification System | Email (SendGrid) + in-app (WebSocket); triggers: deadline reminders, task assignment, status changes |
| Data Analytics | Burndown chart; completion rate by member; workload distribution pie chart; project progress % |

### 2.3 User Classes

| User Class | Description | Frequency | Expertise |
|---|---|---|---|
| Project Owner | Creates project; full admin privileges | Daily | Basic–Intermediate |
| Team Member | Creates/edits/moves tasks; views analytics | Daily | Basic |
| System Administrator | Manages accounts and system config | Weekly | Advanced |

### 2.4 Operating Environment
- **Client:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (desktop & tablet)
- **Server:** Linux (AWS EC2), Python 3.10+
- **Database:** PostgreSQL 14+ on AWS RDS
- **Network:** HTTPS (TLS 1.2+)

### 2.5 Design & Implementation Constraints
- Frontend: React 18+ (TypeScript); Backend: Python FastAPI
- AI module: external LLM API (OpenAI or Claude), no local GPU
- Email: SendGrid free tier (100 emails/day)
- Timeline: 12 weeks, team of 5
- VCS: Git on GitHub

### 2.6 Assumptions & Dependencies
**Assumptions:** Users have stable internet, valid email addresses, and the LLM API interface remains stable.

**Dependencies:** External LLM API, SendGrid, AWS infrastructure, open-source libs (React, Ant Design, react-beautiful-dnd, FastAPI, SQLAlchemy, Recharts).

---

## 3. External Interface Requirements

### 3.1 User Interfaces
Responsive SPA built with React and Ant Design. Primary views:

- **Login / Registration:** Email + password inputs, registration form, password reset link
- **Dashboard / Project List:** All user projects with name, progress %, upcoming deadlines; "Create Project" button
- **Kanban Board:** Columns (To Do, In Progress, Review, Done) with draggable task cards showing title, assignee avatar, label, deadline; "Add Task" and "AI Decompose" buttons
- **Task Detail Modal:** Full task info: title, description, assignee, labels, deadline, subtasks, comments, activity log
- **AI Decomposition Panel:** Side panel to input high-level description; shows AI-generated subtasks with effort + suggested assignees
- **Analytics Dashboard:** Burndown chart, completion rate bar chart, workload pie chart, overall progress %
- **Notification Center:** In-app panel showing task assignment alerts, deadline reminders, status changes

### 3.2 Hardware Interfaces
Web-based; no specialized hardware. Requires standard network + AWS cloud hardware.

### 3.3 Software Interfaces

| Interface | Description |
|---|---|
| OpenAI / Claude API | REST API for task decomposition. Input: task description text. Output: JSON with subtasks, effort estimates, assignee suggestions |
| SendGrid API | REST API for transactional email (deadline reminders, assignments, password reset) |
| PostgreSQL | Relational DB via SQLAlchemy ORM — stores users, projects, tasks, notifications, analytics |
| GitHub API (optional) | Link commits to tasks |

### 3.4 Communications Interfaces
- All client-server: HTTPS (TLS 1.2+) port 443
- Real-time notifications: WebSocket
- Email: SendGrid SMTP/API over TLS
- AI service: HTTPS REST to LLM provider

---

## 4. System Features

### 4.1 Use Case Model

```mermaid
graph LR
    subgraph Actors
        U["Unregistered User"]
        R["Registered User"]
        O["Project Owner"]
        M["Team Member"]
        S["System"]
    end
    subgraph UseCases["TaskFlow System"]
        UC01["UC-01 Register Account"]
        UC02["UC-02 Login / Logout"]
        UC03["UC-03 Create Project"]
        UC04["UC-04 Invite Team Members"]
        UC05["UC-05 Create Task"]
        UC06["UC-06 Move Task (Drag-and-Drop)"]
        UC07["UC-07 Edit / Delete Task"]
        UC08["UC-08 AI Task Decomposition"]
        UC09["UC-09 View Analytics Dashboard"]
        UC10["UC-10 Receive Notifications"]
        UC11["UC-11 Manage Project Settings"]
        UC12["UC-12 Reset Password"]
    end

    U --> UC01
    R --> UC02
    R --> UC03
    R --> UC12
    O --> UC04
    O --> UC11
    M --> UC05
    M --> UC06
    M --> UC07
    M --> UC08
    M --> UC09
    M --> UC10
    O --> UC05
    O --> UC06
    O --> UC07
    O --> UC08
    O --> UC09
    O --> UC10
    S --> UC10
```

#### 4.1.1 Use Case Descriptions

**UC-01: Register Account**
- Actor: Unregistered User
- Pre: Valid email, not already registered
- Post: Account created, redirected to login
- Flow: Navigate to register → Enter name/email/password → Validate → Create account + confirmation email → Redirect to login
- Alt: 3a. Email exists → error; 3b. Weak password → feedback

**UC-02: Login / Logout**
- Actor: Registered User
- Pre: Registered account
- Post: Login: JWT issued, redirect to Dashboard | Logout: session terminated
- Flow: Enter email/password → Validate → Issue JWT → Redirect to Dashboard; Logout: invalidate token + redirect
- Alt: 3a. Invalid credentials → error; 3b. 5 failed attempts → lock 15 min

**UC-03: Create Project**
- Actor: Registered User → becomes Owner
- Pre: Logged in
- Post: Project created with default Kanban columns
- Flow: Click "Create Project" → Enter name/description/deadline → System creates project with default columns → Redirect to Kanban
- Alt: 2a. Empty name → prompt

**UC-04: Invite Team Members**
- Actor: Project Owner
- Pre: Logged in, Owner of project
- Post: Invitation emails sent; accepted invitees added as Members
- Flow: Enter email addresses → Generate unique invite links → Send via SendGrid → Invitee clicks → Added as Member
- Alt: 2a. Email already a member → notify; 5a. No account → redirect to register

**UC-05: Create Task**
- Actor: Owner / Member
- Pre: Logged in with project access
- Post: Task card appears in selected column
- Flow: Click "Add Task" in column → Enter title/description/assignee/labels/deadline → Validate + create → Card appears → Notify assignee
- Alt: 2a. Optional fields can be blank; 3a. Past deadline → warning

**UC-06: Move Task (Drag-and-Drop)**
- Actor: Owner / Member
- Pre: On Kanban board with at least one task
- Post: Task moved, status updated
- Flow: Click & hold card → Drag to new column → Update status → Notify assignee of status change
- Alt: 2a. Drop back to original → no change

**UC-07: Edit / Delete Task**
- Actor: Owner / Member
- Pre: Logged in, task exists
- Post: Edit: task updated | Delete: task removed
- Flow: Click task card → Modify fields → Save → Validate + update | Delete: click Delete → confirm → remove from board + DB
- Alt: 4a. Empty required fields → highlight; 7a. Cancel → unchanged

**UC-08: AI Task Decomposition**
- Actor: Owner / Member
- Pre: Logged in, project access, ≥1 team member
- Post: 3–5 subtasks generated, optionally added to Kanban
- Flow: Click "AI Decompose" → Enter high-level description → Send to LLM API with team profiles → LLM returns 3–5 subtasks → Display for review → User accepts/modifies/rejects → Accepted subtasks added to board
- Alt: 4a. LLM unavailable → error + suggest manual; 6a. User may edit before accepting

**UC-09: View Analytics Dashboard**
- Actor: Owner / Member
- Pre: Logged in, ≥1 task in project
- Post: Dashboard displayed with current data
- Flow: Navigate to Analytics → Retrieve + calculate metrics → Display charts
- Alt: 2a. No tasks → prompt to create tasks

**UC-10: Receive Notifications**
- Actor: Owner / Member
- Pre: Logged in; trigger event occurred
- Post: In-app and/or email notification received
- Flow: Trigger event → Create notification record → Send email (SendGrid) → Push in-app via WebSocket → User sees badge → Mark as read
- Alt: 3a. SendGrid unavailable → retry ×3 then log failure; 4a. WebSocket lost → queue + deliver on reconnect

**UC-11: Manage Project Settings**
- Actor: Project Owner
- Pre: Logged in, Owner of project
- Post: Settings updated
- Flow: Navigate to Settings → Edit name/description/deadline | Customize column names | Remove members | Transfer ownership | Delete project (with name-confirmation)
- Alt: 5a. After transfer, previous Owner becomes Member

**UC-12: Reset Password**
- Actor: Registered User
- Pre: Registered account, forgot password
- Post: Password updated
- Flow: Click "Forgot password?" → Enter email → System sends reset link (valid 1h) → User clicks link → Enter + confirm new password → Validate + update → Redirect to login
- Alt: 2a. Email not registered → generic success (prevent enumeration); 4a. Expired token → error + request new link

---

### 4.2 User Authentication

**Priority:** High

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-001 | System shall allow registration with valid email and password | High |
| REQ-FR-002 | Password must contain ≥8 chars, 1 uppercase, 1 number, 1 special char | High |
| REQ-FR-003 | Authenticate users via JWT tokens (default expiry: 24h) | High |
| REQ-FR-004 | Provide password reset via email verification link | Medium |
| REQ-FR-005 | Logout by invalidating current JWT token | High |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password_hash
        +datetime created_at
        +bool is_active
        +register()
        +login()
        +logout()
        +resetPassword()
    }
    class AuthToken {
        +int id
        +int user_id
        +string token
        +datetime expires_at
        +bool is_revoked
        +generate()
        +validate()
        +revoke()
    }
    class PasswordResetToken {
        +int id
        +int user_id
        +string token
        +datetime expires_at
        +bool is_used
        +generate()
        +validate()
        +markUsed()
    }
    User "1" --> "0..*" AuthToken
    User "1" --> "0..*" PasswordResetToken
```

#### Sequence Diagram — User Login

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AuthAPI
    participant DB

    User->>Browser: Enter email & password
    Browser->>AuthAPI: POST /auth/login {email, password}
    AuthAPI->>DB: SELECT user WHERE email=?
    DB-->>AuthAPI: User record
    AuthAPI->>AuthAPI: Verify bcrypt hash
    alt Valid credentials
        AuthAPI->>DB: INSERT auth_token
        AuthAPI-->>Browser: 200 OK {jwt_token}
        Browser->>Browser: Store JWT in localStorage
        Browser-->>User: Redirect to Dashboard
    else Invalid credentials
        AuthAPI-->>Browser: 401 Unauthorized
        Browser-->>User: "Invalid email or password"
    end
```

---

### 4.3 Project Management

**Priority:** High

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-006 | Allow logged-in user to create project in ≤3 steps | High |
| REQ-FR-007 | Assign project creator as Owner with full admin privileges | High |
| REQ-FR-008 | Allow Owner to invite members by email address | High |
| REQ-FR-009 | Send invitation email with unique join link (via SendGrid) | High |
| REQ-FR-010 | Support two roles: Owner (full access), Member (task management) | Medium |
| REQ-FR-011 | Allow Owner to edit project name, description, deadline | Medium |
| REQ-FR-012 | Allow Owner to remove members from the project | Medium |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class Project {
        +int id
        +string name
        +string description
        +datetime deadline
        +datetime created_at
        +create()
        +edit()
        +delete()
        +transferOwnership()
    }
    class ProjectMember {
        +int id
        +int project_id
        +int user_id
        +string role
        +datetime joined_at
    }
    class Invitation {
        +int id
        +int project_id
        +string email
        +string token
        +datetime expires_at
        +string status
        +generate()
        +accept()
    }
    class User {
        +int id
        +string name
        +string email
    }

    Project "1" --> "1..*" ProjectMember
    ProjectMember "*" --> "1" User
    Project "1" --> "0..*" Invitation
```

#### Sequence Diagram — Create Project & Invite Members

```mermaid
sequenceDiagram
    actor Owner
    participant Browser
    participant ProjectAPI
    participant DB
    participant SendGrid

    Owner->>Browser: Click "Create Project"
    Browser->>ProjectAPI: POST /projects {name, description, deadline}
    ProjectAPI->>DB: INSERT project + INSERT project_member (role=Owner)
    DB-->>ProjectAPI: project_id
    ProjectAPI-->>Browser: 201 Created {project}
    Browser-->>Owner: Redirect to Kanban board

    Owner->>Browser: Enter email addresses to invite
    Browser->>ProjectAPI: POST /projects/{id}/invite {emails[]}
    loop For each email
        ProjectAPI->>DB: INSERT invitation {token, email}
        ProjectAPI->>SendGrid: Send invite email with unique link
    end
    ProjectAPI-->>Browser: 200 OK
    Browser-->>Owner: "Invitations sent"

    note over Browser,DB: Invitee clicks link
    Browser->>ProjectAPI: GET /invitations/{token}/accept
    ProjectAPI->>DB: Verify token, INSERT project_member (role=Member)
    ProjectAPI-->>Browser: Redirect to project
```

---

### 4.4 Kanban Board

**Priority:** High

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-013 | Display Kanban board with columns: To Do, In Progress, Review, Done | High |
| REQ-FR-014 | Allow add/edit/delete task cards with title, description, labels, deadline, assignee | High |
| REQ-FR-015 | Support drag-and-drop to move cards between columns | High |
| REQ-FR-016 | Auto-update task status when card is moved to a different column | High |
| REQ-FR-017 | Allow filtering tasks by assignee, label, or deadline | Medium |
| REQ-FR-018 | Allow searching tasks by title or description keyword | Medium |
| REQ-FR-019 | Allow Owner to customize column names | Low |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class KanbanBoard {
        +int id
        +int project_id
        +getColumns()
        +addColumn()
    }
    class Column {
        +int id
        +int board_id
        +string name
        +int position
        +string status
        +rename()
        +reorder()
    }
    class TaskCard {
        +int id
        +int column_id
        +int project_id
        +string title
        +string description
        +string status
        +datetime deadline
        +int assignee_id
        +string[] labels
        +int position
        +create()
        +edit()
        +delete()
        +move(column_id)
    }
    class User {
        +int id
        +string name
    }

    KanbanBoard "1" --> "1..*" Column
    Column "1" --> "0..*" TaskCard
    TaskCard "*" --> "0..1" User : assignee
```

#### Sequence Diagram — Create Task & Move Task

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant TaskAPI
    participant DB
    participant NotificationService

    User->>Browser: Click "Add Task" in column
    Browser->>Browser: Open task creation form
    User->>Browser: Enter title, description, assignee, labels, deadline
    Browser->>TaskAPI: POST /tasks {column_id, title, ...}
    TaskAPI->>DB: INSERT task
    DB-->>TaskAPI: task_id
    TaskAPI->>NotificationService: Trigger assignment notification
    TaskAPI-->>Browser: 201 Created {task}
    Browser-->>User: Task card appears in column

    User->>Browser: Drag task card to new column
    Browser->>TaskAPI: PATCH /tasks/{id} {column_id: new_col, status: new_status}
    TaskAPI->>DB: UPDATE task SET column_id, status
    TaskAPI->>NotificationService: Trigger status change notification
    TaskAPI-->>Browser: 200 OK {task}
    Browser-->>User: Card appears in new column
```

---

### 4.5 AI Task Decomposition

**Priority:** High

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-020 | Provide AI input panel for entering high-level task description | High |
| REQ-FR-021 | Send task description + team member profiles to LLM API | High |
| REQ-FR-022 | Display 3–5 AI-generated subtasks with title, description, estimated effort, suggested assignee | High |
| REQ-FR-023 | Allow user to accept, modify, or reject each subtask before adding to board | High |
| REQ-FR-024 | Display error + suggest manual creation if LLM API unavailable | Medium |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class AIDecompositionService {
        +buildPrompt(description, members)
        +callLLMAPI(prompt)
        +parseResponse(response)
        +handleError()
    }
    class AIRequest {
        +int id
        +int user_id
        +int project_id
        +string description
        +datetime requested_at
        +string status
    }
    class Subtask {
        +int id
        +int request_id
        +string title
        +string description
        +string effort_estimate
        +int suggested_assignee_id
        +string review_status
        +accept()
        +reject()
        +modify()
    }
    class TeamMember {
        +int id
        +string name
        +string skills
    }

    AIDecompositionService --> AIRequest
    AIRequest "1" --> "3..5" Subtask
    AIDecompositionService --> TeamMember : context
```

#### Sequence Diagram — AI Task Decomposition

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AIService
    participant LLMAPI["LLM API (OpenAI/Claude)"]
    participant TaskAPI
    participant DB

    User->>Browser: Click "AI Decompose", enter description
    Browser->>AIService: POST /ai/decompose {description, project_id}
    AIService->>DB: Fetch team member profiles
    DB-->>AIService: Members[]
    AIService->>AIService: Build prompt (description + member context)
    AIService->>LLMAPI: POST /completions {prompt}
    alt LLM Available
        LLMAPI-->>AIService: JSON {subtasks[{title, description, effort, assignee}]}
        AIService->>DB: INSERT ai_request + subtasks
        AIService-->>Browser: 200 OK {subtasks[]}
        Browser-->>User: Display subtask suggestions for review
        User->>Browser: Accept / Modify / Reject each subtask
        Browser->>TaskAPI: POST /tasks (for each accepted subtask)
        TaskAPI->>DB: INSERT tasks
        TaskAPI-->>Browser: Tasks created
        Browser-->>User: Subtasks appear on Kanban board
    else LLM Unavailable
        LLMAPI-->>AIService: Error / Timeout
        AIService-->>Browser: 503 Service Unavailable
        Browser-->>User: "AI unavailable. Please create tasks manually."
    end
```

---

### 4.6 Notification System

**Priority:** High

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-025 | Send email notification to assignee when task is assigned | High |
| REQ-FR-026 | Send email + in-app reminder at 24h and 1h before task deadline | High |
| REQ-FR-027 | Send in-app notification when task status changes | Medium |
| REQ-FR-028 | Deliver in-app notifications in real-time via WebSocket | High |
| REQ-FR-029 | Allow users to view notification history in notification center | Medium |
| REQ-FR-030 | Allow users to mark notifications as read | Low |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class Notification {
        +int id
        +int user_id
        +string type
        +string message
        +bool is_read
        +datetime created_at
        +int related_task_id
        +markAsRead()
    }
    class NotificationService {
        +createNotification(user_id, type, message)
        +pushWebSocket(notification)
        +sendEmail(user, notification)
        +checkDeadlines()
    }
    class EmailService {
        +sendViaSendGrid(to, subject, body)
        +retryOnFailure(maxRetries=3)
    }
    class WebSocketManager {
        +sendToUser(user_id, payload)
        +queueIfDisconnected(notification)
    }
    class User {
        +int id
        +string email
    }

    NotificationService --> Notification : creates
    NotificationService --> EmailService
    NotificationService --> WebSocketManager
    Notification "*" --> "1" User
```

#### Sequence Diagram — Deadline Reminder Notification

```mermaid
sequenceDiagram
    participant Scheduler
    participant NotificationService
    participant DB
    participant EmailService["SendGrid API"]
    participant WSManager["WebSocket Manager"]
    participant Browser

    Scheduler->>NotificationService: triggerDeadlineCheck() (runs periodically)
    NotificationService->>DB: SELECT tasks WHERE deadline IN [now+24h, now+1h]
    DB-->>NotificationService: tasks[]
    loop For each task
        NotificationService->>DB: INSERT notification record
        NotificationService->>EmailService: POST send email to assignee
        alt SendGrid available
            EmailService-->>NotificationService: 202 Accepted
        else SendGrid unavailable
            NotificationService->>NotificationService: Retry up to 3 times, then log failure
        end
        NotificationService->>WSManager: push(user_id, notification)
        alt User connected
            WSManager->>Browser: WebSocket frame {notification}
            Browser-->>Browser: Show notification badge
        else User disconnected
            WSManager->>WSManager: Queue notification
            note over WSManager: Deliver on reconnect
        end
    end
```

---

### 4.7 Data Analytics

**Priority:** Medium

#### Functional Requirements

| Req ID | Description | Priority |
|---|---|---|
| REQ-FR-031 | Display burndown chart: remaining tasks vs. time | Medium |
| REQ-FR-032 | Display bar chart: task completion rate by team member | Medium |
| REQ-FR-033 | Display pie chart: workload distribution across members | Medium |
| REQ-FR-034 | Display overall project progress as percentage | Medium |
| REQ-FR-035 | Update analytics in real-time as tasks are created/moved/completed | Low |

#### Conceptual Class Diagram

```mermaid
classDiagram
    class AnalyticsService {
        +getBurndownData(project_id)
        +getCompletionRateByMember(project_id)
        +getWorkloadDistribution(project_id)
        +getProjectProgress(project_id)
    }
    class BurndownPoint {
        +datetime date
        +int remaining_tasks
        +int completed_tasks
    }
    class MemberStats {
        +int user_id
        +string name
        +int assigned_tasks
        +int completed_tasks
        +float completion_rate
    }
    class ProjectProgress {
        +int total_tasks
        +int completed_tasks
        +float progress_percentage
    }

    AnalyticsService --> BurndownPoint : generates
    AnalyticsService --> MemberStats : generates
    AnalyticsService --> ProjectProgress : generates
```

#### Sequence Diagram — View Analytics Dashboard

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AnalyticsAPI
    participant DB

    User->>Browser: Navigate to Analytics tab
    Browser->>AnalyticsAPI: GET /projects/{id}/analytics
    AnalyticsAPI->>DB: Query task history, completion dates, assignees
    DB-->>AnalyticsAPI: Raw task data
    AnalyticsAPI->>AnalyticsAPI: Calculate burndown points
    AnalyticsAPI->>AnalyticsAPI: Calculate completion rate per member
    AnalyticsAPI->>AnalyticsAPI: Calculate workload distribution
    AnalyticsAPI->>AnalyticsAPI: Calculate project progress %
    AnalyticsAPI-->>Browser: 200 OK {burndown[], memberStats[], progress}
    Browser->>Browser: Render charts (Recharts)
    Browser-->>User: Display Analytics Dashboard
```

---

### 4.8 Dialog Maps

#### 4.8.1 Application Navigation Flow

```mermaid
stateDiagram-v2
    [*] --> LoginPage
    LoginPage --> Dashboard : Login success
    LoginPage --> RegisterPage : Click Register
    LoginPage --> PasswordResetPage : Forgot password
    RegisterPage --> LoginPage : Registration success
    PasswordResetPage --> LoginPage : Reset success
    Dashboard --> KanbanBoard : Open project
    Dashboard --> CreateProjectModal : Click Create Project
    CreateProjectModal --> KanbanBoard : Project created
    KanbanBoard --> TaskDetailModal : Click task card
    KanbanBoard --> AIDecomposePanel : Click AI Decompose
    KanbanBoard --> AnalyticsDashboard : Click Analytics tab
    KanbanBoard --> ProjectSettings : Click Settings
    KanbanBoard --> NotificationCenter : Click notification bell
    TaskDetailModal --> KanbanBoard : Close modal
    AIDecomposePanel --> KanbanBoard : Subtasks added
    AnalyticsDashboard --> KanbanBoard : Back
    ProjectSettings --> Dashboard : Delete project / Back
    NotificationCenter --> KanbanBoard : Close
```

#### 4.8.2 Task Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> ToDo : Task created
    ToDo --> InProgress : Move to "In Progress"
    InProgress --> Review : Move to "Review"
    Review --> InProgress : Rejected / needs rework
    Review --> Done : Approved
    InProgress --> ToDo : Move back
    Done --> InProgress : Reopened
    Done --> [*] : Task deleted
    ToDo --> [*] : Task deleted
```

---

### 4.9 Activity Diagrams

#### 4.9.1 User Registration and Project Creation

```mermaid
flowchart TD
    A([Start]) --> B[Navigate to Registration Page]
    B --> C[Enter name, email, password]
    C --> D{Valid input?}
    D -- No --> C
    D -- Yes --> E[Create account]
    E --> F[Send confirmation email]
    F --> G[Redirect to Login]
    G --> H[Enter credentials]
    H --> I{Valid credentials?}
    I -- No --> H
    I -- Yes --> J[JWT issued, redirect to Dashboard]
    J --> K[Click Create Project]
    K --> L[Enter project name, description, deadline]
    L --> M{Name provided?}
    M -- No --> L
    M -- Yes --> N[Create project with default columns]
    N --> O[Redirect to Kanban Board]
    O --> P[Click Invite Members]
    P --> Q[Enter email addresses]
    Q --> R[Send invitation emails]
    R --> S([End])
```

#### 4.9.2 AI Task Decomposition Workflow

```mermaid
flowchart TD
    A([Start]) --> B[Click AI Decompose button]
    B --> C[Enter high-level task description]
    C --> D[Fetch team member profiles from DB]
    D --> E[Build prompt with description + member context]
    E --> F[Call LLM API]
    F --> G{API available?}
    G -- No --> H[Display error: AI unavailable]
    H --> I[Suggest manual task creation]
    I --> Z([End])
    G -- Yes --> J[Receive 3-5 subtasks JSON]
    J --> K[Display subtasks for user review]
    K --> L{For each subtask}
    L --> M{User decision}
    M -- Accept --> N[Add subtask to Kanban board]
    M -- Modify --> O[Edit subtask details] --> N
    M -- Reject --> P[Discard subtask]
    N --> Q{More subtasks?}
    P --> Q
    Q -- Yes --> L
    Q -- No --> Z
```

#### 4.9.3 Deadline Notification Workflow

```mermaid
flowchart TD
    A([Scheduler triggers]) --> B[Query tasks with deadlines in 24h or 1h]
    B --> C{Tasks found?}
    C -- No --> Z([End])
    C -- Yes --> D[For each task]
    D --> E[Create notification record in DB]
    E --> F[Send email via SendGrid]
    F --> G{SendGrid available?}
    G -- Yes --> H[Email sent successfully]
    G -- No --> I{Retry count < 3?}
    I -- Yes --> F
    I -- No --> J[Log failure]
    H --> K[Push in-app notification via WebSocket]
    J --> K
    K --> L{User connected?}
    L -- Yes --> M[Deliver notification to browser]
    L -- No --> N[Queue notification for later delivery]
    M --> O{More tasks?}
    N --> O
    O -- Yes --> D
    O -- No --> Z
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Req ID | Description | Priority |
|---|---|---|
| REQ-NF-001 | Kanban board loads within 3 seconds under normal network | High |
| REQ-NF-002 | Drag-and-drop responds within 500 ms | High |
| REQ-NF-003 | AI decomposition returns results within 10 seconds | Medium |
| REQ-NF-004 | Support ≥50 concurrent users without degradation | Medium |
| REQ-NF-005 | In-app notifications delivered within 2 seconds of trigger | Medium |

### 5.2 Safety

| Req ID | Description | Priority |
|---|---|---|
| REQ-NF-006 | No user data deleted without explicit confirmation | High |
| REQ-NF-007 | Maintain data integrity during concurrent task updates | High |

### 5.3 Security

| Req ID | Description | Priority |
|---|---|---|
| REQ-NF-008 | Passwords stored with bcrypt, min cost factor 10 | High |
| REQ-NF-009 | All client-server communication via HTTPS (TLS 1.2+) | High |
| REQ-NF-010 | JWT tokens max expiry 24 hours | High |
| REQ-NF-011 | Users can only access projects they are explicitly invited to | High |
| REQ-NF-012 | Validate and sanitize all user inputs (SQL injection, XSS) | High |

### 5.4 Software Quality Attributes

| Attribute | Requirement |
|---|---|
| Availability | 99% uptime during the semester |
| Reliability | Recover from crashes without data loss for committed transactions |
| Maintainability | PEP 8 (Python) and ESLint/Prettier (TypeScript) standards |
| Portability | Deployable via Docker on any Linux-based cloud platform |
| Usability | New user creates project + task within 5 minutes without docs |
| Testability | All API endpoints with unit tests, ≥70% code coverage |

### 5.5 Business Rules
- **BR-01:** Each project has exactly one Owner. Ownership is transferable.
- **BR-02:** A user can belong to max 10 active projects simultaneously.
- **BR-03:** Only Owner can delete a project; requires typed-name confirmation.
- **BR-04:** AI decomposition requires ≥2 team members to generate assignment suggestions.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| Burndown Chart | Graphical remaining tasks vs. time |
| JWT | JSON Web Token — compact token for secure information transmission |
| Kanban Board | Visual workflow tool with columns (stages) and cards (tasks) |
| LLM | Large Language Model — AI for task decomposition |
| ORM | Object-Relational Mapping (SQLAlchemy) |
| Project Owner | Creator with full admin privileges |
| SendGrid | Cloud email delivery service |
| SPA | Single Page Application |
| Subtask | Smaller actionable task generated by AI module |
| Task Card | Visual element on Kanban representing a task |
| TLS | Transport Layer Security |
| WebSocket | Full-duplex communication protocol for real-time notifications |
| Workload Distribution | Task allocation per member, shown as pie chart |

---

## Appendix B: Analysis Models

### B.1 Overall Conceptual Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password_hash
        +bool is_active
    }
    class Project {
        +int id
        +string name
        +string description
        +datetime deadline
    }
    class ProjectMember {
        +int project_id
        +int user_id
        +string role
    }
    class KanbanBoard {
        +int id
        +int project_id
    }
    class Column {
        +int id
        +string name
        +int position
        +string status
    }
    class TaskCard {
        +int id
        +string title
        +string description
        +string status
        +datetime deadline
        +string[] labels
    }
    class Notification {
        +int id
        +string type
        +string message
        +bool is_read
    }
    class AIRequest {
        +int id
        +string description
        +string status
    }
    class Subtask {
        +int id
        +string title
        +string effort_estimate
        +string review_status
    }

    User "1..*" --> "0..*" Project : member of
    Project "1" --> "1" KanbanBoard
    KanbanBoard "1" --> "1..*" Column
    Column "1" --> "0..*" TaskCard
    TaskCard "*" --> "0..1" User : assigned to
    Project "1" --> "0..*" AIRequest
    AIRequest "1" --> "1..*" Subtask
    User "1" --> "0..*" Notification
    ProjectMember --> Project
    ProjectMember --> User
```

### B.2 Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        bool is_active
        datetime created_at
    }
    PROJECTS {
        int id PK
        string name
        string description
        datetime deadline
        datetime created_at
    }
    PROJECT_MEMBERS {
        int project_id FK
        int user_id FK
        string role
        datetime joined_at
    }
    KANBAN_BOARDS {
        int id PK
        int project_id FK
    }
    COLUMNS {
        int id PK
        int board_id FK
        string name
        int position
        string status
    }
    TASKS {
        int id PK
        int column_id FK
        int project_id FK
        int assignee_id FK
        string title
        string description
        string status
        datetime deadline
        string labels
        int position
        datetime created_at
        datetime updated_at
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        int task_id FK
        string type
        string message
        bool is_read
        datetime created_at
    }
    AI_REQUESTS {
        int id PK
        int user_id FK
        int project_id FK
        string description
        string status
        datetime created_at
    }
    SUBTASKS {
        int id PK
        int request_id FK
        int task_id FK
        string title
        string description
        string effort_estimate
        int suggested_assignee_id FK
        string review_status
    }
    AUTH_TOKENS {
        int id PK
        int user_id FK
        string token
        datetime expires_at
        bool is_revoked
    }
    PASSWORD_RESET_TOKENS {
        int id PK
        int user_id FK
        string token
        datetime expires_at
        bool is_used
    }
    INVITATIONS {
        int id PK
        int project_id FK
        string email
        string token
        string status
        datetime expires_at
    }

    USERS ||--o{ PROJECT_MEMBERS : "belongs to"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has"
    PROJECTS ||--|| KANBAN_BOARDS : "has"
    KANBAN_BOARDS ||--o{ COLUMNS : "has"
    COLUMNS ||--o{ TASKS : "contains"
    USERS ||--o{ TASKS : "assigned to"
    USERS ||--o{ NOTIFICATIONS : "receives"
    TASKS ||--o{ NOTIFICATIONS : "triggers"
    USERS ||--o{ AI_REQUESTS : "creates"
    PROJECTS ||--o{ AI_REQUESTS : "has"
    AI_REQUESTS ||--o{ SUBTASKS : "generates"
    USERS ||--o{ AUTH_TOKENS : "has"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "has"
    PROJECTS ||--o{ INVITATIONS : "has"
```

---

## Appendix C: To Be Determined

| TBD # | Description | Target |
|---|---|---|
| TBD-001 | Final LLM provider selection (OpenAI vs. Claude) based on cost/performance | Week 6 |
| TBD-002 | Prompt engineering strategy for optimal AI decomposition results | Week 6 |
| TBD-003 | Email notification templates and content wording | Week 7 |
| TBD-004 | Max file attachment size for task comments (if file upload supported) | Week 7 |
| TBD-005 | Error handling and retry strategy for LLM API failures | Week 6 |
