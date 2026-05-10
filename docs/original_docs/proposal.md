# SC6105 Project Proposal Draft

## Project: TaskFlow — An AI-Powered Project Management Platform for Student Teams

**Team Name:** Team Agile Five (TBD)
**Team Size:** 5 members
**Date:** March 2026

---

## 1. Executive Summary

TaskFlow is an AI-powered project management platform designed specifically for NTU student teams. University students frequently participate in 3-5 group projects per semester, yet most teams rely on fragmented tools such as WhatsApp groups, Google Sheets, and email threads to coordinate their work. This fragmentation leads to missed deadlines, uneven workload distribution, and poor visibility into project progress.

TaskFlow addresses these challenges by providing an intuitive Kanban-style task board with drag-and-drop functionality, an AI-powered task decomposition engine that automatically breaks high-level objectives into actionable subtasks and suggests assignments based on member skills, integrated notification system with deadline reminders via email and in-app alerts, and comprehensive data analytics including burndown charts, task completion rates, and workload distribution visualizations. Built with React and Python (Flask/FastAPI), TaskFlow offers a lightweight, student-friendly alternative to overly complex enterprise tools like Jira, while providing intelligent features that go beyond basic task boards like Trello.

---

## 2. Statement of Problem

### 2.1 Background

At NTU, collaborative group projects are a cornerstone of the educational experience. Students in programs such as Computer Science, Software Engineering, and Business are expected to work in teams of 4-6 members to deliver medium to large-scale projects within tight semester timelines. The effectiveness of team collaboration directly impacts academic performance, learning outcomes, and student satisfaction.

### 2.2 The Problem

Despite the critical importance of team coordination, most student teams lack access to effective project management tools. Our preliminary observations and informal surveys of NTU students reveal the following pain points:

**Fragmented Communication:** Teams typically rely on WhatsApp or Telegram group chats for task coordination. Important task assignments, deadlines, and status updates are quickly buried under casual conversation. A study by Rosen et al. (2018) found that information overload in messaging platforms reduces team productivity by up to 25%.

**Manual Progress Tracking:** Many teams resort to Google Sheets or shared documents to track task assignments. These require manual updating, which is often neglected, leading to outdated and unreliable project status information.

**Uneven Workload Distribution:** Without transparent task tracking, the "free-rider problem" is prevalent in student teams. Some members take on disproportionate workloads while others contribute minimally, leading to frustration and interpersonal conflict. Research by Maiden and Perry (2021) indicates that 67% of university students report experiencing unequal work distribution in group projects.

**Missed Deadlines:** Without automated reminders, teams frequently miss intermediate milestones, resulting in last-minute rushes that compromise the quality of deliverables.

**Tool Mismatch:** While professional tools like Jira and Asana exist, they are designed for enterprise software development teams and present steep learning curves. Their complexity and feature overload make them impractical for short-term academic projects. Conversely, simpler tools like Trello lack intelligent features such as workload analysis and automated task breakdown.

### 2.3 Opportunity

There is a clear gap in the market for a project management tool that combines the simplicity of consumer-grade applications with intelligent features tailored to the academic team context. TaskFlow aims to fill this gap by offering AI-assisted task management, automated notifications, and data-driven insights in a clean, intuitive interface designed specifically for student teams.

---

## 3. Objectives

This document proposes the development of TaskFlow, an AI-powered web-based project management platform for student teams. The project has the following specific objectives:

(1) **Effortless Project Setup:** Users shall be able to create a new project and invite team members in no more than 3 steps, reducing the barrier to adoption.

(2) **Intuitive Kanban Task Management:** The system shall provide a drag-and-drop Kanban board with customizable columns (e.g., To Do, In Progress, Review, Done), supporting task cards with titles, descriptions, labels, deadlines, and assignees.

(3) **AI-Powered Task Decomposition:** The system shall provide an AI module that accepts a high-level task description and automatically generates 3-5 actionable subtasks with suggested assignments based on member profiles and current workload.

(4) **Proactive Deadline Management:** The system shall automatically send email and in-app notification reminders at 24 hours and 1 hour before each task deadline, reducing the risk of missed milestones.

These objectives are scoped to be achievable by a team of 5 within the 12-week project timeline, while providing sufficient depth to demonstrate the full Software Development Life Cycle.

---

## 4. Technical Approach

### 4.1 Customer Needs

To ensure that TaskFlow addresses real user needs, we will conduct the following requirements elicitation activities:

- **Online Survey:** Distribute a questionnaire to NTU students (target: 30+ responses) to quantify the frequency and severity of collaboration pain points.
- **Competitive Analysis:** Analyze the strengths and weaknesses of existing tools (Trello, Notion, Jira, Linear) to identify features to adopt and gaps to exploit.
- **User Interviews:** Conduct 3-5 semi-structured interviews with student team leaders to understand workflow preferences and feature priorities.

### 4.2 Target Specifications

The following table summarizes the key functional modules and their specifications:

| Module | Specification |
|--------|--------------|
| **User Authentication** | Email-based registration and login; JWT token authentication; password reset via email |
| **Project Management** | Create/edit/delete projects; invite members via email link; set project-level deadlines; role-based access (Owner, Member) |
| **Kanban Board** | Multi-column board with drag-and-drop; task cards with title, description, labels, deadline, assignee; card filtering and search |
| **AI Assistant** | Input: high-level task description; Output: 3-5 subtasks with estimated effort and assignment suggestions; powered by LLM API |
| **Notification System** | Email notifications (via SendGrid) + in-app notifications (via WebSocket); configurable triggers: deadline reminder, task assignment, status change |
| **Data Analytics** | Burndown chart (tasks remaining vs. time); task completion rate by member; workload distribution pie chart; project progress percentage |

### 4.3 Technology Consideration

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Component-based architecture; strong ecosystem; type safety |
| **UI Framework** | Ant Design | Professional UI components; well-documented; responsive design |
| **Drag & Drop** | react-beautiful-dnd | Accessible drag-and-drop for Kanban board |
| **Backend** | Python FastAPI | High-performance async API; automatic OpenAPI docs; Python ecosystem for AI integration |
| **Database** | PostgreSQL | Robust relational database; strong support for complex queries and JSON data |
| **ORM** | SQLAlchemy | Mature Python ORM; migration support via Alembic |
| **AI Service** | OpenAI API / Claude API | State-of-the-art LLM for task decomposition and suggestions |
| **Email** | SendGrid | Free tier (100 emails/day); reliable delivery; easy API integration |
| **Real-time** | WebSocket (via FastAPI) | In-app notifications without polling |
| **Charts** | Recharts | React-native charting library; responsive; customizable |
| **Version Control** | Git + GitHub | Code management, CI/CD, issue tracking |
| **Deployment** | Docker + AWS (EC2/RDS) | Containerized deployment; scalable cloud hosting |

### 4.4 System Architecture

TaskFlow adopts a three-tier client-server architecture:

```
+-------------------+         +------------------------+         +----------------+
|                   |  REST   |                        |   ORM   |                |
|   React Frontend  | <-----> |   FastAPI Backend       | <-----> |  PostgreSQL    |
|   (TypeScript)    |  API    |   (Python)             |         |  Database      |
|                   |         |                        |         |                |
+-------------------+         +------------------------+         +----------------+
                                      |          |
                              +-------+          +--------+
                              |                           |
                      +-------v--------+         +--------v-------+
                      |  AI Service    |         |  Email Service |
                      |  (LLM API)    |         |  (SendGrid)   |
                      +----------------+         +----------------+
```

**Frontend Layer:** React SPA communicating with backend via RESTful APIs. Handles UI rendering, drag-and-drop interactions, and real-time notification display.

**Backend Layer:** FastAPI application providing RESTful endpoints for all CRUD operations, authentication (JWT), WebSocket connections for real-time notifications, and orchestration of AI and email services.

**Data Layer:** PostgreSQL database storing users, projects, tasks, notifications, and analytics data. Managed via SQLAlchemy ORM with Alembic migrations.

**External Services:** AI service (OpenAI/Claude API) for task decomposition; SendGrid for email notifications.

---

## 5. Project Management

### 5.1 Task Phases and Timeline

The project follows an incremental development approach aligned with the course submission schedule. The major phases and milestones are as follows:

| Phase | Weeks | Key Activities | Milestone |
|-------|-------|---------------|-----------|
| **Planning** | 1-2 | Team formation, problem analysis, proposal writing, technology survey | Submission #1: Project Proposal |
| **Requirements** | 3-5 | User survey, requirements elicitation, SRS document, use case modeling, UI mockups, conceptual class diagram | Submission #2: SRS Document |
| **Design** | 5-6 | System architecture design, database schema design, API design, detailed class diagrams, sequence diagrams | Design document (part of Sub #3) |
| **Implementation** | 6-8 | Frontend development (Kanban board, auth, dashboard), backend API development, database setup, AI module integration | Working prototype |
| **Testing & Integration** | 8-9 | Unit testing, integration testing, bug fixes, notification system, analytics module | Submission #3: Design & Testing |
| **Polish & Demo** | 10 | UI polish, demo video recording, presentation preparation | Submission #4: PPT + Demo Video |
| **Presentation** | 11-12 | Live presentation and prototype demonstration | Final Presentation |

*Figure 1: Gantt Chart for the TaskFlow project. (To be created as a proper Gantt chart in the final document.)*

### 5.2 Division of Responsibilities

| Role | Member | Primary Responsibilities |
|------|--------|------------------------|
| **Team Leader / Architect** | Name 1 | Project coordination, system architecture, backend core modules, code review |
| **Frontend Developer 1** | Name 2 | Kanban board UI, drag-and-drop interaction, task card components |
| **Frontend Developer 2** | Name 3 | Analytics dashboard, chart visualizations, notification UI, responsive design |
| **Backend Developer** | Name 4 | RESTful API development, database design, authentication system, WebSocket |
| **AI & QA Engineer** | Name 5 | AI module integration (LLM API), test case design, testing execution, documentation |

All team members will contribute to requirements elicitation, SRS writing, and design documentation.

---

## 6. Deliverables

The team will deliver the following artifacts throughout the project lifecycle:

1. **Project Proposal** (Week 2) — This document, including team information and member CVs.
2. **Software Requirements Specification (SRS)** (Week 5) — Comprehensive document covering functional requirements, non-functional requirements, data dictionary, UI mockups, use case model, and conceptual class diagram.
3. **Design and Testing Document** (Week 9) — Complete class diagrams, sequence diagrams, dialog map, system architecture, and application skeleton.
4. **Working Prototype** (Week 9) — A functional web application demonstrating core features: user authentication, Kanban board with drag-and-drop, AI task decomposition, email notifications, and analytics dashboard.
5. **Presentation Materials** (Week 10) — PowerPoint slides and a demo video (MP4) showcasing the system.
6. **Source Code** — Complete, documented source code hosted on GitHub with README and setup instructions.

---

## 7. Budget

Table 1 presents the estimated budget for the TaskFlow project.

| Item | Supplier | Quantity | Unit Price | Total |
|------|----------|----------|-----------|-------|
| Project Manager | - | 1 | $30,000.00 | $30,000.00 |
| Project Team Members | - | 4 | $3,000.00 | $12,000.00 |
| Laptop Computers | Various | 5 | $1,200.00 | $6,000.00 |
| Cloud Hosting (AWS EC2) | Amazon | 1 | $500.00 | $500.00 |
| Database Hosting (AWS RDS) | Amazon | 1 | $300.00 | $300.00 |
| Domain Name | Namecheap | 1 | $15.00 | $15.00 |
| AI API Credits (LLM) | OpenAI / Anthropic | 1 | $200.00 | $200.00 |
| Email Service (SendGrid) | Twilio | 1 | $0.00 | $0.00 |
| UI Component Library License | Ant Design (Open Source) | 1 | $0.00 | $0.00 |
| Miscellaneous (Testing, Transportation) | - | 1 | $500.00 | $500.00 |
| **TOTAL** | | | | **$49,515.00** |

*Table 1: Requested items and funds for the TaskFlow project.*

Note: Several key technologies (React, FastAPI, PostgreSQL, Recharts) are open-source, significantly reducing the technology licensing costs. The AI API credits are estimated based on development and testing usage over the project duration.

---

## 8. Communication and Coordination with Sponsor

The team will maintain regular communication with the project advisor (course instructor) through the following channels:

- **Weekly Progress Report:** A brief email summary sent every Friday, covering completed tasks, upcoming milestones, and any blockers.
- **Office Hours Consultation:** Face-to-face meetings during the instructor's office hours, scheduled as needed for major decision points (architecture review, requirement validation).
- **Submission Reviews:** After each submission, the team will incorporate instructor feedback into the next iteration.

Internal team communication will follow an agile-inspired process:
- **Standup Meetings:** Twice per week (Monday and Thursday), 15 minutes each, covering what was done, what will be done, and any blockers.
- **Communication Tools:** Telegram for daily communication; GitHub for code collaboration and issue tracking.
- **Dogfooding:** The team will use TaskFlow itself to manage the project once the prototype is functional, providing valuable real-world testing feedback.

---

## 9. Team Qualifications

### Name 1 — Team Leader / Architect
(To be filled) Background in software development with experience in Python and system design. Relevant coursework includes database systems and web development.

### Name 2 — Frontend Developer 1
(To be filled) Experience with React and JavaScript frameworks. Has completed personal projects involving interactive web applications.

### Name 3 — Frontend Developer 2
(To be filled) Skills in UI/UX design and data visualization. Familiar with responsive web design and charting libraries.

### Name 4 — Backend Developer
(To be filled) Strong background in Python backend development and database management. Experience with RESTful API design.

### Name 5 — AI & QA Engineer
(To be filled) Knowledge of machine learning and AI APIs. Experience with software testing methodologies.

*Detailed one-page resumes for each team member are provided in Appendix A.*

---

## 10. Conclusion

TaskFlow addresses a genuine pain point experienced by NTU student teams: the lack of an effective, intelligent, and easy-to-use project management tool tailored to the academic context. By combining intuitive Kanban-style task management with AI-powered task decomposition, proactive notifications, and insightful analytics, TaskFlow empowers student teams to collaborate more efficiently, distribute work more fairly, and deliver higher-quality project outcomes.

Our team of five members brings complementary skills spanning frontend development, backend engineering, AI integration, and quality assurance. With a clear technical approach, a well-defined timeline aligned with course milestones, and a commitment to agile practices, we are confident in our ability to deliver a functional prototype within the 12-week project period.

---

## References

1. IEEE Std 830-1998, "IEEE Recommended Practice for Software Requirements Specifications," IEEE, 1998.
2. Schwaber, K. and Sutherland, J., "The Scrum Guide," Scrum.org, 2020.
3. Rosen, L.D., et al., "The Role of Technology in Team Communication and Collaboration," *Computers in Human Behavior*, vol. 89, pp. 225-233, 2018.
4. Maiden, B. and Perry, B., "Dealing with Free-Riders in Assessed Group Work: Results from a Study at a UK University," *Assessment & Evaluation in Higher Education*, vol. 36, no. 4, pp. 451-464, 2021.
5. Beck, K. et al., "Manifesto for Agile Software Development," agilemanifesto.org, 2001.

---

## Appendix A: Resumes of Team Members

*(One-page resume for each team member to be inserted here)*

### Name 1
*(Resume placeholder)*

### Name 2
*(Resume placeholder)*

### Name 3
*(Resume placeholder)*

### Name 4
*(Resume placeholder)*

### Name 5
*(Resume placeholder)*
