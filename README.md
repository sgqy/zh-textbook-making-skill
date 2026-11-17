# 中文教材编写技能集合

用于编写中文讲解教材的 7 个 Agent Skills。覆盖材料研究、品类选择、章节写作、练习、审校、媒体排版和维护，可按任务单独安装。

完整教材任务按“收集材料 → 分析并选定具体品类 → 编排 → 写作与活动 → 审校与呈现”展开。已有稿件可以直接进入相应任务。方法资料包含编程、工程、数学、外语、视觉艺术、音乐、自然科学和人文。

正文说明、题目要求和反馈使用中文。所学外语、术语原词、代码、公式、乐谱和必要原文按教学需要保留。

## 安装

准备 Node.js 22.20 或更高版本及 npm，在你的教材项目目录运行：

```bash
npx skills add sgqy/zh-textbook-making-skill
```

按提示选择技能和使用的 AI 工具。默认安装到当前项目；追加 `-g` 可安装到用户目录。通用安装器支持的选项见 [skills 官方说明](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)。

只安装章节写作技能到 Codex：

```bash
npx skills add sgqy/zh-textbook-making-skill --skill textbook-write -a codex
```

将全部 7 个技能安装到当前项目的 Codex：

```bash
npx skills add sgqy/zh-textbook-making-skill --skill '*' -a codex -y
```

也可以先查看列表：

```bash
npx skills add sgqy/zh-textbook-making-skill --list
```

这里使用 npm 提供的 `skills` 安装器，从 GitHub 安装技能。无需 clone、构建或单独安装本仓库的 npm 包。

## 选择技能

| 技能 | 适合的请求 |
|---|---|
| [textbook-research](skills/textbook-research/SKILL.md) | 整理资料、研究教材案例、比较教法及证据缺口 |
| [textbook-plan](skills/textbook-plan/SKILL.md) | 分析材料、选定具体品类、规划目标与目录 |
| [textbook-write](skills/textbook-write/SKILL.md) | 写一个教学单元、改一节讲解、连接示例与反馈 |
| [textbook-exercises](skills/textbook-exercises/SKILL.md) | 设计习题、实验、交际或创作活动与反馈 |
| [textbook-review](skills/textbook-review/SKILL.md) | 检查专业内容、先修、活动、媒体和一致性 |
| [textbook-layout](skills/textbook-layout/SKILL.md) | 制作图解、样张、指定格式及媒体检查 |
| [textbook-maintain](skills/textbook-maintain/SKILL.md) | 按勘误、版本变化或读者反馈修订并重验 |

例如在支持技能调用的 AI 工具中输入：

```text
请用 $textbook-plan 分析 materials 目录中的资料。
读者会基础代数，希望学会用反例判断全称命题。
先选定具体品类和教学结构，再给出单元安排。
```

```text
请用 $textbook-review 审阅 chapter-02.md。
只给问题位置、依据和建议，重点检查量词、证明与练习反馈。
```

技能包含方法与检查要求。代码运行、PDF 渲染、音频播放等操作使用你的 AI 工具已具备的能力；无法实际检查的部分应明确报告。无需特定服务账号才能阅读和使用这些指令。

## Clone 后继续迭代

```bash
git clone https://github.com/sgqy/zh-textbook-making-skill.git
cd zh-textbook-making-skill
npm ci
npm run verify
```

在项目目录打开 AI 编程工具，直接描述修改需求即可。也可以将任务写入 [TASK.md](TASK.md)，再让 AI 按任务继续。根目录 [AGENTS.md](AGENTS.md)说明修改位置与验证要求。

```text
请阅读 AGENTS.md 和 TASK.md，继续本轮迭代。
为数学证明审校补充一个量词错误案例，依据实际试用结果调整规则。
修改后同步安装副本，运行验证，并记录实际完成与未完成的检查。
```

开发入口见 [CONTRIBUTING.md](CONTRIBUTING.md)。本仓库没有运行时 npm 依赖；npm 命令用于构建和检查技能文件。

## 项目结构与状态

```text
skills/                 可安装技能；每个包自带参考资料和许可证
authoring/references/   共用品类与方法资料的维护源
docs/                   开发说明、验证记录、历史研究与规划
evals/                  行为评估输入、评价依据和真实试用结果
scripts/                构建与检查工具
tests/                  独立安装与副本一致性测试
AGENTS.md               AI 开发约定
TASK.md                 可写入当前迭代提示词
```

这是首版技能实现。已执行的检查与局限见[验证记录](docs/verification.md)，研究来源和历史草稿见[文档索引](docs/README.md)。结构检查通过不等于教学效果已经得到验证。

## 协议

本仓库原创技能、工具与文档使用 [MIT](LICENSE) 协议。参考教材和链接指向的第三方材料保留原有权利，未作为教材全文、图版或音频打包分发。
