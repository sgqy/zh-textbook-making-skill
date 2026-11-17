# 首版验证记录

版本：0.1.0。日期：2026 年 11 月 18 日。当前记录由编写者维护，检查结果只覆盖实际执行的项目。

## 已执行

- 已生成 7 个技能包的参考资料和独立许可证。
- 已确认官方 `skills` 安装器的发现目录、选择技能及本地安装参数，npm 当前返回版本为 1.9.0，要求 Node.js 22.20 或更高版本。
- 本地环境为 Windows、Node.js 26.12.1、npm 11.20.0。
- `npm run verify` 通过：生成副本一致，技能元数据、包内引用、许可证和项目文档链接正常；5 项自动测试全部通过。
- 使用 `skill-creator` 提供的 `quick_validate.py` 逐个检查，7 个技能均通过。该工具只作开发期校验，不是安装依赖。
- 使用真实的 `skills@1.9.0` 在两个隔离项目中安装：单选 `textbook-write` 得到 1 个技能，选择全部得到 7 个技能。两次都使用 Codex 目标与复制方式，安装后的包再次通过独立引用检查。

本地安装复现方式：从独立临时项目执行以下命令，将路径替换为你的仓库位置。

```bash
npx skills@1.9.0 add /仓库绝对路径 --skill textbook-write -a codex --copy -y
npx skills@1.9.0 add /仓库绝对路径 --skill '*' -a codex --copy -y
```

## 公开发布验证

- [GitHub 仓库](https://github.com/sgqy/zh-textbook-making-skill)已设为公开，GitHub 识别协议为 MIT。
- 从公开地址在第三个隔离项目实际安装全部技能，得到 7 个技能；安装后的包全部通过独立引用检查。安装锁文件记录来源为该仓库，提交为 `550f7163cc5c37f68ab5a59eb5a65141b4ccd583`。
- 同一提交的 [GitHub Actions 检查](https://github.com/sgqy/zh-textbook-making-skill/actions/runs/44192784997)在 `ubuntu-latest` 和 `windows-latest` 上均通过，使用 Node.js 22，执行 `npm ci --ignore-scripts` 和 `npm run verify`。

公开地址安装复现命令：

```bash
npx skills@1.9.0 add sgqy/zh-textbook-making-skill --skill '*' -a codex --copy -y
```

## 当前能力边界

八类方法资料都已随技能打包；各领域专业内容仍需按实际教材核验。首版未进行独立模型盲测、教师试教或真实读者学习效果研究。准备好行为测试任务不表示任务已运行。历史研究中的样页观察不等于本版教材输出已经渲染或媒体已经播放。
