你需要阅读 TaskFlow/docs/original_docs 中的原始设计文档，然后完成一份给LLM Agent执行的Coding Plan.
最终要求:
- 这是一份学校的作业，只需要做一个demo就可以
- demo直接在本地运行，在web上进行交互
- 功能不用完全按照original_docs进行实现，你可以先决定demo video（约4-5分钟）展示哪些内容，然后进行实现
- 一切以demo video的需求为主，包括开发和测试计划满足demo即可
- 你可以决定使用任何框架，保持简单高效，能够满足demo即可

关于Agent Coding Plan:
- 你需要先完全阅读TaskFlow/docs/original_docs中的原始设计文档，对原始需求有详细的了解
- 以main agent + coding agent + review/test agent的形式进行
- main agent: 统领全部sub agent
- coding agent: 根据plan进行代码实现和代码纠错
- review/test agent: 测试demo，输出测试报告和修改意见等等
- 你可以使用front-end design, chrome dev tool等plugin辅助

先交付给我一个完整的Agent Coding Plan





You need to read the original design documents in TaskFlow/docs/original_docs, and then produce a Coding Plan for an LLM Agent to execute.

Requirements:
---

This is a school assignment; only a demo is needed.

The demo should run locally and be interacted with via the web.

The functionality does not need to fully follow the original documents. You can decide what to demonstrate in the demo video (about 4–5 minutes) and then implement accordingly.

Everything should serve the needs of the demo video, including development and testing plans—just meet the demo requirements.

You may use any framework; keep it simple and efficient, sufficient for the demo.
---


About the Agent Coding Plan:

---
You must first fully read the original design documents in TaskFlow/docs/original_docs to gain a detailed understanding of the original requirements.

Adopt a structure of main agent + coding agent + review/test agent.

Main agent: oversees all sub-agents.

Coding agent: writes and debugs code according to the plan.

Review/test agent: tests the demo, outputs test reports and suggestions for changes, etc.

You may use plugins such as front-end design tools or Chrome DevTools to assist.
---

First deliver to me a complete Agent Coding Plan and put it at TaskFlow/docs/coding_plan.md. No need to start.

