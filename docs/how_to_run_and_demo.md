# TaskFlow 如何运行和录制 Demo 视频

这份文档按“从 `git pull` 到录完视频”的顺序写。你可以一边看一边执行。

## 1. 前置环境

确认电脑上已经有这些工具：

```bash
git --version
uv --version
node --version
npm --version
```

建议版本：

- Python 3.11+
- Node.js 18+
- npm 9+
- uv 任意新版都可以

如果 `uv --version` 不存在，需要先安装 uv。

## 2. 拉取最新代码

进入项目目录并拉取最新代码：

```bash
cd /home/ubuntu/jz_code/TaskFlow
git pull
```

如果你是在另一台电脑第一次运行，可以先 clone：

```bash
git clone <你的仓库地址> TaskFlow
cd TaskFlow
```

## 3. 安装后端依赖

```bash
cd /home/ubuntu/jz_code/TaskFlow/backend
uv sync
cd ..
```

后端使用 FastAPI + SQLite。SQLite 数据库会自动生成，不需要安装 PostgreSQL。

## 4. 安装前端依赖

```bash
cd /home/ubuntu/jz_code/TaskFlow/frontend
npm install
cd ..
```

如果 `npm install` 显示 moderate vulnerability，可以先不用处理。这个 demo 是本地录制用，不影响运行。

## 5. 配置环境变量

第一次运行时，复制后端环境变量模板：

```bash
cd /home/ubuntu/jz_code/TaskFlow
cp backend/.env.example backend/.env
```

`DEEPSEEK_API_KEY` 是可选的：

- 如果你填写真实 key，AI 分解会尝试调用 DeepSeek。
- 如果你不填写，系统会自动使用本地 mock 数据，画面仍然可以正常演示。

建议录制前使用 mock，更稳定：

```bash
cat backend/.env
```

确认里面可以是这样：

```bash
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 6. 重置 Demo 数据

每次正式录制前都运行一次：

```bash
cd /home/ubuntu/jz_code/TaskFlow
./scripts/reset.sh
```

这会重新生成干净的 demo 数据：

- 3 个用户：Alice、Bob、Carol
- 1 个项目：SC6105 Group Project
- 12 张 Kanban 任务卡
- 4 列：To Do / In Progress / Review / Done
- Bob 的 3 条未读通知
- Analytics 图表需要的历史完成数据

看到下面输出就可以：

```bash
Seeded TaskFlow demo data.
```

## 7. 启动系统

```bash
cd /home/ubuntu/jz_code/TaskFlow
./start.sh
```

等待终端出现：

```bash
backend ready on :8000
frontend ready on :5173
TaskFlow demo: http://localhost:5173/login
```

然后打开浏览器：

```text
http://localhost:5173/login
```

停止系统时，在运行 `./start.sh` 的终端按：

```text
Ctrl + C
```

## 8. 录制前检查

正式录制前先彩排一次：

1. 打开 `http://localhost:5173/login`
2. 点击 Alice 登录
3. 确认 Dashboard 里有 `SC6105 Group Project`
4. 点击项目进入 Board
5. 确认四列都有任务卡，总共 12 张
6. 拖动 `Implement login API` 到 Review
7. 点击 `AI Decompose`
8. 点击 `Decompose`，确认出现 4 个子任务
9. 点击 Analytics，确认图表出现
10. 切换到 Bob，确认右上角通知红点是 `3`

彩排结束后，再执行一次：

```bash
./scripts/reset.sh
```

这样正式录制会从干净状态开始。

## 9. 浏览器和录屏设置

推荐设置：

- 浏览器：Chrome
- 窗口大小：1440 x 900，或者 1280 x 800
- 浏览器缩放：100%
- 关闭书签栏、无关插件图标和系统通知
- 最好用无痕窗口
- 录屏：1080p，30 fps

录制 Scene 4 前，先复制这句话到剪贴板：

```text
Build a complete user authentication page with email login and password reset
```

## 10. 正式 Demo 操作流程

### Scene 1：登录

页面停在：

```text
http://localhost:5173/login
```

操作：

1. 停留 2 秒，让观众看到 Alice / Bob / Carol
2. 点击 Alice
3. 进入 Dashboard

### Scene 2：项目仪表盘

操作：

1. 停留 2 秒
2. 鼠标划过 `SC6105 Group Project` 的进度条
3. 点击项目卡片
4. 进入 Kanban Board

### Scene 3：Kanban 拖拽

操作：

1. 停留 3 秒，让观众看到四列任务
2. 找到 `Implement login API`
3. 慢慢拖到 `Review` 列
4. 点击任意任务卡，打开任务详情
5. 停留 2 秒后关闭详情弹窗

### Scene 4：AI 任务分解

操作：

1. 点击右上方 `AI Decompose`
2. 在输入框中粘贴：

```text
Build a complete user authentication page with email login and password reset
```

3. 点击 `Decompose`
4. 等 4 个子任务出现
5. 点击前 3 个任务的 `Accept`
6. 第 4 个任务可以点击 `Reject`
7. 关闭 AI 面板
8. 停留 2 秒，看 To Do 列新增任务

### Scene 5：Analytics

操作：

1. 点击顶部 `Analytics`
2. 停留 3 秒，让图表加载
3. 鼠标依次划过：
   - 进度环
   - Burndown line chart
   - Completion bar chart
   - Workload pie chart

### Scene 6：切换到 Bob 看通知

操作：

1. 点击右上角 Alice 用户菜单
2. 点击 `Switch user / Logout`
3. 回到登录页后点击 Bob
4. 确认右上角铃铛红点显示 `3`
5. 点击铃铛
6. 点击其中一条通知
7. 确认红点从 `3` 变成 `2`

### Scene 7：收尾

操作：

1. 点击顶部 `Board`
2. 停留在 Kanban Board 全景
3. 结束录屏

## 11. 英文旁白

完整英文旁白在：

```text
docs/demo_flow.md
```

建议做法：

1. 录屏时先不说话，只把画面录清楚。
2. 录完后按 `docs/demo_flow.md` 的 Narration 后期配音。
3. 最终视频控制在 4 到 5 分钟。

## 12. 常见问题

### 端口被占用

如果 `8000` 或 `5173` 被占用，先停止旧进程：

```bash
pkill -f "uvicorn app.main:app"
pkill -f "vite"
```

然后重新启动：

```bash
./start.sh
```

### 页面打不开

确认 `./start.sh` 还在运行，并且终端出现：

```bash
backend ready on :8000
frontend ready on :5173
```

再打开：

```text
http://localhost:5173/login
```

### AI 没有返回

如果没有配置 `DEEPSEEK_API_KEY`，系统会自动走 mock，正常应该很快返回。

如果你配置了真实 key，但网络慢或 API 不稳定，建议录制时清空 key：

```bash
DEEPSEEK_API_KEY=
```

然后重启：

```bash
./start.sh
```

### 数据乱了

比如误删任务、通知数量不对、AI 已经生成过任务，直接重置：

```bash
./scripts/reset.sh
```

然后刷新浏览器即可。必要时重启：

```bash
./start.sh
```

## 13. 最短命令版

如果你只想复制命令，按这个顺序执行：

```bash
cd /home/ubuntu/jz_code/TaskFlow
git pull

cp backend/.env.example backend/.env

cd backend
uv sync
cd ..

cd frontend
npm install
cd ..

./scripts/reset.sh
./start.sh
```

然后打开：

```text
http://localhost:5173/login
```

正式录制前再执行一次：

```bash
./scripts/reset.sh
```
