# ReflectOPD project page

本地静态论文项目页，无需安装依赖或构建。

## 打开

直接用浏览器打开 `index.html`。也可以在这个目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

然后访问 http://127.0.0.1:4173/ 。使用本地 HTTP 预览可获得最稳定的剪贴板支持。

## 内容与文件

- `index.html`：页面内容与章节结构。
- `style.css`：响应式排版、白底蓝色主题、统一 Arial 字体与移动端样式。
- `data.js`：Reflection 案例、完整 prompt、问题与策略、定性对比图片索引。
- `app.js`：交互、GenEval / OneIG 数值、Skill 实验结果和曲线。
- `assets/`：本地图片、SVG 图表、可下载的矢量 PDF。

章节顺序：TL;DR 与 Reflection → Skill Optimization 与跨模型转移 → 可交互多轮案例 → ReflectOPD → Training dynamics / Performance → RL / Diversity。

## 已实现交互

点击每一轮图片显示相应 Judge、Problem、Strategy、Prompt；prompt 重点词高亮，可复制。长反思记录可展开。图像和方法图可点击放大，Escape 关闭。

切换 Qwen executor、GenEval backbone、定性对比案例、OneIG alignment/diversity 和三组四-seed案例。窄屏表格可以横向滑动。

## 数据来源与口径

结果已与 2026-10-16 下载的 Overleaf Arxiv 最新稿核对；GenEval 主表、OneIG 表、跨基准摘要与 skill transfer 结果已同步。原图来自此前为论文整理的案例；Diversity 的三组对比直接提取自当前论文 PDF。

- Training-free 的 96.9% 是官方 GenEval verifier 参与反思的 oracle-verifier 设置下，三轮以内的累计 macro pass rate，区别于 ReflectOPD 主结果中的 0.92。
- Qwen Skill 转移采用当前表格中的数值。
- ReflectOPD 默认设计为 verify on rollout / distill on rollout，EMA teacher 与原始条件 student 在共同 rollout 状态上进行速度匹配。
- Prompt 保留记录原文。部分 Problem / Strategy 为展示摘要，原始长记录可展开；OCR 茶包装摘要根据 OCR 和 prompt 变化整理。
- Color binding 使用记录中的 Gemini 案例，与 Qwen 两个案例的历史配置不同，页面已注明。
- 主定性对比复用论文选定的 #212、#316、#415、#479，不添加 pass/fail 标签。
- Diversity 原图列顺序为 Base / ReflectOPD / Flow-GRPO；网页通过独立裁切视窗重新展示为 Base / Flow-GRPO / ReflectOPD，分数也对应重排。没有改变图像内容。
- OneIG alignment 使用三类 695 prompts；diversity 使用五类 1,120 prompts，两者统计范围不同。

没有填入未经确认的作者、机构、论文公开地址或代码仓库地址。未进行公网部署，也不依赖第三方登录、CDN、远程字体或外部脚本。需要上线时可直接把这些静态文件交给任意静态托管服务。

## 当前主题

Research / white + blue。正文 16px、界面标签和表格 14px、小节标题 18px、章节标题 28px、论文标题 40px；手机端只调整论文标题和章节标题。标题统一句首大写，保留专有名称及缩写；不使用全大写装饰标签。

## 仓库集成

本页位于 `visual-ai.github.io/reflectopd/`，包含项目主页、交互、视频和六组 OCR 精选对比。独立的全量 OCR 检查工具不属于主页依赖，保留在原本地项目中。

从仓库根目录预览：

```sh
python3 -m http.server 4174 --bind 127.0.0.1
```

访问 http://127.0.0.1:4174/reflectopd/ 。全部资源使用相对路径，可在 GitHub Pages 子目录下访问。

## 2026-10-16 结果核对

- Qwen3.5-9B + Skill 的第三轮为 91.7%。
- 96.9% 是 Gemini-3.6-Flash 在 oracle-verifier 设置下的累计三轮 macro pass rate。
- GenEval 表中 Candidate budget 是每个输出的候选生成预算；非 Ours 数值引用 ReflectionFlow 的已发表比较。
- RL 探索示意图已同步论文 Figure 14；OneIG 文字同时说明 alignment / diversity 的取舍。
- 保留网页精选案例；OCR 比论文五组多展示 Magic Show Tonight，其余五组图像与论文对应。
