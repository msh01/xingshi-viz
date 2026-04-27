# 百家姓起源图谱

一个用图谱交互方式探索百家姓起源的开源项目。

项目尝试把传统文本型的姓氏起源资料转成可探索的关系网络：默认只展示高层源流结构，用户可以通过点击或搜索逐步展开具体姓氏、起源类型、历史阶段和相关关系。

## 特性

- 高层结构优先：默认展示古姓源流、起源类型和历史阶段，不一次性铺开全部姓氏节点。
- 按需展开：点击“姬姓源流”“封地得姓”等节点后，局部展开代表姓氏。
- 姓氏搜索：支持按汉字或拼音搜索，例如 `王` / `wang`。
- 详情面板：点击或搜索姓氏后，展示起源摘要、起源类型、时代、地望、相关人物和相关姓氏。
- 稳定图谱布局：使用固定坐标布局，避免力导向图持续抖动造成阅读疲劳。
- 可扩展数据结构：姓氏资料、源流关系和图谱转换逻辑分层组织，便于后续补充百家姓全量数据。

## 技术栈

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AntV G6](https://g6.antv.antgroup.com/) 图可视化
- [Lucide React](https://lucide.dev/) 图标

## 本地运行

安装依赖：

```bash
bun install
```

启动开发服务：

```bash
bun dev
```

打开：

```text
http://127.0.0.1:4222
```

构建生产版本：

```bash
bun run build
```

启动生产服务：

```bash
bun start
```

## 项目结构

```text
src/
  app/
    page.tsx                      # 首页入口
    layout.tsx                    # 页面元信息与根布局
    globals.css                   # 全局样式
  components/
    surname-origin-explorer.tsx   # 图谱交互主组件
  data/
    surnames.ts                   # 姓氏与源流样例数据
  lib/
    graph-data.ts                 # 数据到 G6 图谱节点/边的转换
  types/
    surname.ts                    # 姓氏数据类型定义
```

## 数据模型

每个姓氏记录包含：

- `name`：姓氏汉字
- `pinyin`：拼音
- `brief`：简介
- `origins`：起源记录，可包含起源类型、源流、时代、地望、人物和摘要
- `relatedSurnames`：相关姓氏

示例：

```ts
{
  id: "wang",
  name: "王",
  pinyin: "wang",
  brief: "王姓为典型多源姓氏...",
  origins: [
    {
      kind: "ancestor-name",
      sourceRoot: "姬姓源流",
      period: "先秦",
      place: "山西太原",
      ancestor: "太子晋",
      summary: "一支以周灵王太子晋后裔为代表..."
    }
  ],
  relatedSurnames: ["周", "姬", "赵", "陈"]
}
```

## 后续计划

- 补全百家姓全量数据。
- 为每条起源记录增加可靠出处和引用链接。
- 增加地理视图，展示姓氏起源地与迁徙分布。
- 增加时间线视图，按历史阶段查看姓氏形成脉络。
- 支持多源姓氏的路径对比。
- 增加数据校验和贡献规范。

## 贡献

欢迎提交 issue 和 pull request，尤其欢迎：

- 补充姓氏起源资料
- 校正数据来源
- 改进图谱交互
- 优化移动端体验
- 增加历史、地理、文献维度的可视化

提交数据类贡献时，请尽量附上出处，避免只提交无法核验的口耳相传内容。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。
