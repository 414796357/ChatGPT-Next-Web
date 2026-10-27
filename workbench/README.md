# 投监工作台 · 第 0 期可点击原型

静态原型，不依赖 Node。浏览器打开 `index.html`，或：

```bash
python3 serve.py 5175
```

然后访问 http://127.0.0.1:5175/

交互数据存在浏览器 `localStorage`（键 `supervise-workbench-v13`）。主页可「恢复演示数据」。

建议窗口宽度 ≥ 1100px。

聚升现金 / 年金流动性先读 `data/` 快照。内网取数代理：

```bash
python3 breach_proxy.py 5199
```

打迁移包：

```bash
bash scripts/make-portable.sh
```
