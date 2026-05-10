# TaskFlow Demo 录制流程（demo_flow.md）

**目的：** 给"录制者本人"用的操作手册。从开机到导出视频的全流程。视频目标长度：4–5 分钟。

**核心原则：**
- 所有需要展示的数据（用户、项目、任务、通知）都已经预先写入数据库。**录制者只需要做最关键的几个动作：登录、拖拽一次、AI 分解一次、点几个按钮。**
- **旁白用英文**，方便提交课程作业；操作说明保留中文，方便你看清楚。
- 配套文档：`docs/coding_plan.md`（功能与场景定义）。

---

## 0. 录制前准备（开始录制前 10 分钟内完成）

### 0.1 环境检查清单

依次执行下面这些命令，确认全部通过再录制：

```bash
# 1. 进入项目目录
cd /home/ubuntu/jz_code/TaskFlow

# 2. 重置数据库到干净的种子状态（这会重新生成 12 个任务、3 条通知、Done 列的历史数据等）
./scripts/reset.sh
# 或者手动两条：
# rm -f backend/taskflow.db
# cd backend && uv run python -m app.seed && cd ..

# 3. 确认 .env 中 DEEPSEEK_API_KEY 已填写（如果想演示真实 LLM）
#    如果没填，AI 分解会走 mock，仍然能演示
cat backend/.env | grep DEEPSEEK_API_KEY

# 4. 启动整套应用
./start.sh
```

预期：终端打印 "backend ready on :8000" 和 "frontend ready on :5173"，浏览器手动打开 `http://localhost:5173/login`。

### 0.2 浏览器准备

1. 用 **Chrome**（DevTools 兼容性最好）。
2. 浏览器窗口尺寸 **1440×900**（显示器小则 1280×800）。
3. 关掉书签栏、扩展图标，建议用 **干净的隐身窗口**。
4. 缩放 100%（Ctrl+0）。
5. 准备好剪贴板：把 Scene 4 要粘贴的那句英文事先复制好（详见 §2 Scene 4）。

### 0.3 录屏工具

- macOS：QuickTime / OBS / Loom
- Linux：OBS Studio / SimpleScreenRecorder
- 设置：1080p、30 fps。
- 推荐**事后配音**（更稳）：录制时不开麦，录完后对着画面念 §2 各 Scene 的 Narration。

### 0.4 录制前彩排（强烈建议）

不录的方式走一遍 §2 的 7 个 Scene，确认：

- [ ] Alice 登录后看到 1 个项目，进度条非空
- [ ] Kanban 看板四列都有任务卡（共 12 张）
- [ ] 拖拽流畅，刷新后位置保留
- [ ] AI 分解能在 15 秒内出结果
- [ ] Analytics 三张图都有数据
- [ ] Bob 登录后铃铛红点显示 "3"

走完一遍后，**再次**执行 `./scripts/reset.sh` 重置数据库，让正式录制从干净状态开始。

---

## 1. 数据预设说明（你不需要做的事）

种子数据已经包含了下面所有内容，**录制时不需要现场创建**：

| 类别 | 已预设内容 | 出现在哪个 Scene |
|---|---|---|
| 用户 | Alice（项目负责人）、Bob、Carol，三种不同头像颜色 | 1, 6 |
| 项目 | "SC6105 Group Project"，2 周后截止，进度约 25% | 2 |
| 看板任务 | 12 张任务卡分布在 4 列：To Do (4) / In Progress (3) / Review (2) / Done (3) | 3 |
| 历史完成数据 | Done 列 3 张任务的 `completed_at` 时间分散在过去一周 | 5（燃尽图斜率） |
| Bob 的未读通知 | 3 条（任务被分配 + 状态变更），不同时间戳 | 6 |
| 工作量分布 | 三个成员任务数不同，使饼图、柱状图有差异 | 5 |

**录制者不需要：**
- ❌ 注册账号
- ❌ 创建项目
- ❌ 手动创建任意任务
- ❌ 手写 AI 输入框里的文字（只需粘贴）

**录制者需要做的，全部加起来：**
- ✅ 4 次主要点击 + 1 次拖拽 + 1 次粘贴+回车 + 3 次接受按钮 + 1 次切换用户 + 1 次点铃铛。

整个录制其实是"按引导走流程"，没有打字工作。

---

## 2. 完整演示脚本（按时间线 ｜ Narration in English）

下方每个 Scene 给出三栏：
- **操作**（中文）：你的鼠标 / 键盘动作
- **画面**（中文）：观众这一刻看到的内容
- **Narration**（English）：你（或后期配音）要说的话——**按这个文本念**

> 提示：所有 *斜体* 是给录制者看的导演备注，不要念出来。

---

### Scene 1 ｜ 开场 + 登录（0:00–0:25 ｜ 25 秒）

**操作**

1. 浏览器停在 `http://localhost:5173/login`。
2. *镜头停留 2 秒*，让观众看清三个用户卡片（Alice / Bob / Carol）。
3. 鼠标移到 **Alice** 卡片上 *悬停 1 秒*。
4. 点击 **Alice**，自动跳转到 `/`（项目仪表盘）。

**画面**

干净的登录页，三个用户头像卡片横排。点击后切到仪表盘，顶部出现 "Hi, Alice"。

**Narration (English)**

> "TaskFlow is an AI-powered project management platform built for student team projects. To showcase the collaboration features, I've pre-seeded three users — Alice, Bob, and Carol. Let's start as Alice, the project lead."

---

### Scene 2 ｜ 项目仪表盘（0:25–0:50 ｜ 25 秒）

**操作**

1. 仪表盘加载完成，*停留 2 秒*。
2. 鼠标轻轻划过 "SC6105 Group Project" 卡片的进度条（不点击，只是引导视线）。
3. 点击该卡片，跳转到 `/board/1`。

**画面**

一张项目卡片，显示项目名、截止日期（2 周后）、当前进度（约 25%）。右上角铃铛、用户头像。

**Narration (English)**

> "After signing in, Alice sees all the projects she's part of, each with a clear progress indicator. Let's open the SC6105 group project to see the Kanban board."

---

### Scene 3 ｜ Kanban 看板 + 拖拽（0:50–1:50 ｜ 60 秒）★ 镜头要慢

**操作**

1. 看板加载完成，*停留 3 秒*让观众扫一眼四列。
2. **拖拽 1 次**：
   - 在 "In Progress" 列里找一张明显的任务卡（例如 "Implement login API"）。
   - 按住卡片 → **慢速** 拖到 "Review" 列底部 → 松开。
   - *动作要慢，让观众看清拖拽动画*。
3. **打开任务详情**（不编辑）：
   - 点击 "Review" 列里某张卡 → 弹出任务详情面板。
   - *停留 2–3 秒* 让观众看清字段（标题 / 描述 / 负责人 / 截止日期）。
   - 点击外部或 ✕ 关闭面板。

**画面**

四列均匀分布，每列 2–4 张卡。卡片显示：标题、负责人头像（带颜色的圆 + 首字母）、标签、相对时间（"in 3 days"）。拖拽时其它卡平滑让位，目标列高亮。

**Narration (English)**

> "This is the Kanban board — four columns following a standard To Do, In Progress, Review, Done flow. The board is already populated with twelve tasks across the team. To update a task's status, I just drag and drop. Watch — I'll move 'Implement login API' from In Progress to Review. The status updates instantly and persists to the backend, so a refresh keeps everything in place. Clicking any card opens the full task detail, where assignees, deadlines, and labels can be edited."

---

### Scene 4 ｜ AI 任务分解（1:50–3:20 ｜ 90 秒）★ 核心亮点

> 录制前把这句英文复制到剪贴板，粘贴即可：
> `Build a complete user authentication page with email login and password reset`

**操作**

1. 在看板顶部工具栏点击 **"AI Decompose"** 按钮。
2. 右侧滑入 AI 面板，*停留 1 秒*让动画完成。
3. 点击文本框 → **Ctrl/Cmd + V** 粘贴上面那句英文。
4. 点击 **"Decompose"** 按钮。
5. 加载状态出现（shimmer / 骨架屏），*停留 5–10 秒*等 LLM 返回。
6. 4 张子任务卡依次淡入。
7. **逐一处理**（共 3 次点击）：
   - 第 1 张：点击 ✅ Accept → 卡片变绿淡出 → 看板对应列出现新卡。
   - 第 2 张：点击 ✅ Accept。
   - 第 3 张：点击 ✅ Accept。
   - 第 4 张：点击 ❌ Reject（演示两种交互都有）。
8. 关闭 AI 面板（点击 ✕ 或外部）。
9. 看板的 "To Do" 列底部多了 3 张刚生成的任务卡，*停留 3 秒*。

**画面**

AI 面板从右侧滑入，宽约屏幕的 1/3。加载时面板顶部 spinner / 进度条。子任务卡有清晰的 Accept / Reject 按钮，hover 高亮。

**Narration (English)**

> "TaskFlow's signature feature is AI-powered task decomposition. Suppose I have a vague high-level goal — 'Build a complete user authentication page with email login and password reset' — and I'm not sure how to split it across the team. I paste the description, click Decompose, and the model — DeepSeek's V4 Flash, called via an OpenAI-compatible endpoint — analyzes the team's skills and current workload, then proposes four concrete subtasks. Each subtask comes with a recommended assignee, a description, and an effort estimate. I can review them one at a time: accept the ones that look right, reject the ones I don't need. The accepted subtasks land directly on the Kanban board as new cards, ready for execution. What used to be ten minutes of manual breakdown is now a few clicks."

> ⚠️ 如果 DEEPSEEK_API_KEY 没填或网络不行：跳过 "DeepSeek's V4 Flash..." 那一句，模型会回退到本地 mock，画面看起来一样，不影响演示。

---

### Scene 5 ｜ 数据分析面板（3:20–4:05 ｜ 45 秒）

**操作**

1. 顶部导航点击 **"Analytics"** 标签。
2. *停留 3 秒*让三张图同时渲染完。
3. 鼠标依次划过：
   - 左上 / 顶部大进度环。
   - 燃尽图（Burndown）：悬停在折线某一天上，tooltip 弹出。
   - 完成率柱状图：悬停一根柱子。
   - 工作量饼图：悬停一片。
4. *最后镜头停留 2 秒*。

**画面**

顶部一行：大进度环 + 已完成/总任务。下方 2×2 网格：折线、柱状、饼图。配色统一。

**Narration (English)**

> "The Analytics tab gives the team a real-time view of project health. At the top is the overall completion rate. The burndown chart tracks remaining tasks over time — you can see we've been steadily knocking work down across the past week. The bar chart breaks down completion by team member, and the pie chart visualizes how the workload is distributed. This makes it easy to spot bottlenecks early and keep contributions balanced — a common pain point in student team projects."

---

### Scene 6 ｜ 通知系统 & 切换用户视角（4:05–4:35 ｜ 30 秒）

**操作**

1. 点击右上角 **当前用户头像** → 下拉菜单选 **"Switch user"** 或 **"Logout"**。
2. 回到登录页，点击 **Bob**。
3. 仪表盘加载，*立刻* 注意右上角铃铛上的红色徽标 **"3"**。
4. 点击铃铛 → 下拉通知面板。
5. 面板里显示 3 条未读通知：
   - "Alice assigned you a task: Implement login API"
   - "Task moved to Review: Write API spec"
   - "Alice assigned you a task: Set up CI"
6. 点击其中一条 → 该条变灰（已读），徽标变为 **"2"**。
7. *停留 2 秒*。

**画面**

切换用户后视角立即切换，右上角头像变成 Bob 的颜色。铃铛红点醒目。通知面板有清晰的"已读/未读"区分，每条带相对时间（"2 min ago"）。

**Narration (English)**

> "Project work happens across multiple people, so let's switch to Bob's view. Bob immediately sees three unread notifications — task assignments and status changes triggered by Alice's recent actions. He can drill into any one to mark it as read. The system keeps the team in sync without anyone needing to ask 'what changed?' in a group chat."

---

### Scene 7 ｜ 收尾（4:35–5:00 ｜ 25 秒）

**操作**

1. 点击导航 "Board" 切回看板页（或浏览器后退）。
2. *镜头停留在看板上不动*。
3. 如果有片尾卡片图，叠在画面上。

**画面**

看板全貌，所有卡片清晰可见。可选：右下角浮一个 "Thank you" 或团队 logo。

**Narration (English)**

> "That's a quick tour of TaskFlow — Kanban-based task management, AI-driven decomposition, real-time analytics, and built-in notifications, all in one lightweight web app. The full source is in our project repository. Thanks for watching."

---

## 3. 录制中常见状况与应急方案

| 状况 | 应急动作 |
|---|---|
| AI 分解 15 秒还没返回 | 等 5 秒；如果仍未返回，**剪掉这段重录**。重录前在终端 Ctrl+C 关掉前端再 `./start.sh` |
| AI 返回的子任务质量很差（标题乱、推荐人错） | 不要慌，演示的是"流程"不是"答案"；继续 Accept/Reject。后期可剪掉特别难看的那一帧。最坏情况：临时 unset DEEPSEEK_API_KEY，走 mock（mock 是确定性的好结果）|
| 拖拽时卡片飞到错列 | 刷新页面会恢复持久化状态，但安全做法是**重录这一小段**（数据不会乱，因为种子数据每次重置都是一样的）|
| 浏览器弹出"是否允许通知"等系统弹窗 | 录制前用隐身窗口，提前点过一次"拒绝"避免再次弹出 |
| 后端 500 / 前端白屏 | 终端会有报错；停止录制 → Ctrl+C → `./scripts/reset.sh` → `./start.sh` → 从头录 |
| 数据库脏了（演示中不小心点了删除等） | 同上，全量重置 |
| 录到一半发现窗口尺寸不对 | 不要中途调整尺寸（会改变所有元素位置），重录 |
| Bob 切换后铃铛红点没显示 | 检查是否真的切到 Bob（看右上角头像颜色和首字母）；如果还不行，刷新一次 |

---

## 4. 录制后检查清单

录完一刀后立刻检查：

- [ ] 时长在 4:00–5:00 之间
- [ ] 七个 Scene 都完整
- [ ] AI 分解部分清晰可见，至少有一次"接受 → 看板更新"的镜头
- [ ] 三张图表都出现在画面里且都有数据
- [ ] 切换用户后铃铛红点清晰可见
- [ ] 没有任何弹窗 / 浏览器 dev tools / 任务栏通知干扰画面
- [ ] 没有出现密码、API key、个人邮箱等敏感信息（重点检查 `.env` 是否露出，AI 面板里输入的文本）
- [ ] （事后配音）旁白与画面动作对得上

---

## 5. 后期建议（非必须）

- **字幕**：用 CapCut / 剪映 / Premiere 加字幕，按 §2 的 Narration 文本即可。
- **片头**：5–10 秒静态卡片，写 "TaskFlow ｜ SC6105 Demo ｜ Group X"。建议加在 Scene 1 之前。
- **片尾**：3–5 秒团队成员名单 + 课程信息。
- **背景音乐**：极轻的 lo-fi instrumental，音量压到 -25 dB 以下不抢旁白。

---

## 6. 录制者职责一览（最简版）

如果你只想看一张"我到底要做什么"的清单：

1. 跑 §0.1 的 4 行命令。
2. 浏览器拉到 1440×900，打开 `http://localhost:5173/login`。
3. 复制 Scene 4 那句英文到剪贴板：`Build a complete user authentication page with email login and password reset`
4. 开录屏。
5. 严格按 §2 的 7 个 Scene 演一遍（5 分钟），全程只需要 4 次主要点击 + 1 次拖拽 + 1 次粘贴 + 3 次 Accept + 1 次切换用户 + 1 次点铃铛。
6. 停录屏。
7. 走一遍 §4 的检查清单。
8. （可选）后期对着画面读 §2 各 Scene 的 Narration 配音；加字幕、片头、片尾。
9. 导出 MP4，1080p，H.264，文件名 `TaskFlow_Demo.mp4`。

完成。
