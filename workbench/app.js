const STORE_KEY = "supervise-workbench-v13";
const OWNER = "姚涵静";

const DEMO_TODOS = [
  { id: "t1", title: "跟进聚升现金标红：招商招金宝货币 3.0732%", source: "jush", due: "今日", done: false, wecom: false },
  { id: "t2", title: "年金流动性标红：甘肃电力招商组合 3.78%", source: "jush", due: "今日", done: false, wecom: false },
  { id: "t3", title: "KM 签报：限制池调整待会签", source: "km", due: "本周", done: false, wecom: false },
  { id: "t4", title: "风控限制池核对新增证券", source: "risk", due: "本周", done: false, wecom: false },
  { id: "t5", title: "托管行估值核对邮件未回", source: "mail", due: "今日", done: false, wecom: false },
  { id: "t6", title: "请投研协助确认流动性口径", source: "wecom", due: "今日", done: false, wecom: true }
];

const DEFAULT_SYS = {
  km: "./source.html?sys=km",
  risk: "./source.html?sys=risk",
  supervise: "./source.html?sys=supervise",
  mail: "./source.html?sys=mail"
};

const SOURCE_LABEL = {
  jush: "聚升",
  km: "KM",
  risk: "风控",
  mail: "邮件",
  wecom: "企微"
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return restoreDemo(false);
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function restoreDemo(persist = true) {
  const state = {
    todos: DEMO_TODOS.map((t) => ({ ...t })),
    papers: [],
    sys: { ...DEFAULT_SYS },
    restoredAt: new Date().toISOString()
  };
  if (persist) saveState(state);
  return state;
}

async function fetchJSON(name) {
  const urls = [
    `http://127.0.0.1:5199/${name}`,
    `./data/${name}`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}
  }
  throw new Error("无法读取 " + name);
}

function nonemptyRows(table) {
  return (table.rows || []).filter((row) => Array.isArray(row) && row.length);
}

function isRedRow(row) {
  return row.some((cell) => cell && cell.red);
}

function cellText(row, i) {
  return (row[i] && row[i].v) || "";
}

function rowOwner(row) {
  const last = row[row.length - 1];
  if (last && last.v) return last.v;
  const prev = row[row.length - 2];
  return (prev && prev.v) || "";
}

function route() {
  const hash = (location.hash || "#/home").replace(/^#/, "");
  return hash || "/home";
}

function navHtml(state) {
  const open = state.todos.filter((t) => !t.done).length;
  const items = [
    ["/home", "主页", ""],
    ["/monitor", "聚升监控", ""],
    ["/todos", "待办", String(open)],
    ["/papers", "底稿", ""],
    ["/mail", "邮件取数", ""],
    ["/map", "系统映射", ""]
  ];
  const here = route();
  return items
    .map(
      ([href, label, count]) =>
        `<a href="#${href}" class="${here.startsWith(href) ? "active" : ""}">${label}${
          count ? `<span class="count">${count}</span>` : ""
        }</a>`
    )
    .join("");
}

function layout(title, subtitle, body, actions = "") {
  const state = loadState();
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">投监工作台</div>
        <div class="sub">第 0 期可点击原型</div>
      </div>
      <nav class="nav">${navHtml(state)}</nav>
      <div class="side-foot">数据在本机浏览器。换电脑后点主页「恢复演示数据」。</div>
    </aside>
    <section class="main">
      <div class="topbar">
        <div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="actions">${actions}</div>
      </div>
      ${body}
    </section>
  `;
}

function renderHome(root, data) {
  const state = loadState();
  const open = state.todos.filter((t) => !t.done);
  const cashRed = data.jush.cash || [];
  const liqRed = data.jush.liquid || [];
  const mineLiq = nonemptyRows(data.liquid).filter((r) => rowOwner(r) === OWNER);
  root.innerHTML = layout(
    "今日投监",
    `聚升快照 ${data.jush.scannedAt || "—"} · 待办 ${open.length} 条未完`,
    `<div class="grid">
      <div class="card kpi span-3 warn">
        <div class="label">现金标红</div>
        <div class="value">${cashRed.length}</div>
        <div class="hint">公募现金占比低于阈值</div>
      </div>
      <div class="card kpi span-3 warn">
        <div class="label">年金流动性标红</div>
        <div class="value">${liqRed.length}</div>
        <div class="hint">含在途 / 含通知存款 / 按成交</div>
      </div>
      <div class="card kpi span-3">
        <div class="label">我名下组合</div>
        <div class="value">${mineLiq.length}</div>
        <div class="hint">合规负责人 ${OWNER}</div>
      </div>
      <div class="card kpi span-3">
        <div class="label">未完待办</div>
        <div class="value">${open.length}</div>
        <div class="hint">含企微协助 ${open.filter((t) => t.wecom).length} 条</div>
      </div>
      <div class="card span-8">
        <h3>一键跳转</h3>
        <div class="jump">
          <a href="${state.sys.km}" target="_blank" rel="noreferrer"><div class="glyph">K</div><b>KM 签报</b><span>会签 / 签报</span></a>
          <a href="${state.sys.risk}" target="_blank" rel="noreferrer"><div class="glyph">风</div><b>风控 / 限制池</b><span>限制池核对</span></a>
          <a href="${state.sys.supervise}" target="_blank" rel="noreferrer"><div class="glyph">聚</div><b>聚升</b><span>现金与流动性</span></a>
          <a href="${state.sys.mail}" target="_blank" rel="noreferrer"><div class="glyph">C</div><b>Coremail</b><span>托管行来信</span></a>
        </div>
      </div>
      <div class="card span-4">
        <h3>待办摘录</h3>
        <ul class="list">
          ${open
            .slice(0, 6)
            .map(
              (t) => `<li><span class="dot ${t.source}"></span><div>${t.title}<div class="muted">${SOURCE_LABEL[t.source] || t.source} · ${t.due}</div></div><span class="tag">${t.wecom ? "企微" : t.due}</span></li>`
            )
            .join("")}
        </ul>
      </div>
      <div class="card span-12">
        <h3>聚升标红</h3>
        <ul class="list">
          ${[...cashRed, ...liqRed]
            .map(
              (x) =>
                `<li><span class="dot jush"></span><div><b>${x.name}</b> ${x.code}<div class="muted">${x.msg}</div></div><span class="tag red">${x.ratio}</span></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>`,
    `<button class="ghost" data-act="restore">恢复演示数据</button>
     <a class="btn" href="#/monitor">打开监控</a>`
  );
  root.querySelector("[data-act=restore]").onclick = () => {
    restoreDemo(true);
    render();
  };
}

function renderTable(table, { onlyRed, onlyMine }) {
  const headers = (table.headers || []).filter((h) => h !== "");
  const headerIndex = [];
  (table.headers || []).forEach((h, i) => {
    if (h !== "") headerIndex.push(i);
  });
  let rows = nonemptyRows(table);
  if (onlyRed) rows = rows.filter(isRedRow);
  if (onlyMine) rows = rows.filter((r) => rowOwner(r) === OWNER);
  if (!rows.length) return `<p class="muted">没有符合筛选的记录。</p>`;
  return `<div class="table-wrap"><table><thead><tr>${headers
    .map((h) => `<th>${h}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((row) => {
      const tds = headerIndex
        .map((i) => {
          const cell = row[i] || { v: "", red: false };
          return `<td class="${cell.red ? "red" : ""}">${cell.v || ""}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("")}</tbody></table></div>`;
}

function renderMonitor(root, data) {
  const tab = sessionStorage.getItem("monitor-tab") || "cash";
  const onlyRed = sessionStorage.getItem("monitor-red") === "1";
  const onlyMine = sessionStorage.getItem("monitor-mine") === "1";
  const table = tab === "cash" ? data.cash : data.liquid;
  root.innerHTML = layout(
    "聚升监控",
    "先读本包快照。连上 5199 代理后可改为内网取数。",
    `<div class="card span-12">
      <div class="tabs">
        <button data-tab="cash" aria-selected="${tab === "cash"}">公募现金</button>
        <button data-tab="liquid" aria-selected="${tab === "liquid"}">年金流动性</button>
        <button data-filter="red" aria-selected="${onlyRed}">只看标红</button>
        <button data-filter="mine" aria-selected="${onlyMine}">只看我的</button>
      </div>
      ${renderTable(table, { onlyRed, onlyMine })}
    </div>`
  );
  root.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.onclick = () => {
      sessionStorage.setItem("monitor-tab", btn.dataset.tab);
      render();
    };
  });
  root.querySelector("[data-filter=red]").onclick = () => {
    sessionStorage.setItem("monitor-red", onlyRed ? "0" : "1");
    render();
  };
  root.querySelector("[data-filter=mine]").onclick = () => {
    sessionStorage.setItem("monitor-mine", onlyMine ? "0" : "1");
    render();
  };
}

function renderTodos(root) {
  const state = loadState();
  root.innerHTML = layout(
    "待办",
    "存在本机浏览器。企微协助不跳转系统，只在这里登记。",
    `<div class="card">
      <form class="todo-form">
        <input name="title" placeholder="新增待办" required />
        <select name="source">
          <option value="jush">聚升</option>
          <option value="km">KM</option>
          <option value="risk">风控</option>
          <option value="mail">邮件</option>
          <option value="wecom">企微协助</option>
        </select>
        <button class="primary" type="submit">添加</button>
      </form>
      <ul class="list">
        ${state.todos
          .map(
            (t) => `<li>
              <input type="checkbox" data-id="${t.id}" ${t.done ? "checked" : ""} />
              <div class="${t.done ? "done" : ""}">${t.title}<div class="muted">${SOURCE_LABEL[t.source]} · ${t.due}${t.wecom ? " · 企微协助" : ""}</div></div>
              <button class="ghost" data-del="${t.id}">删除</button>
            </li>`
          )
          .join("")}
      </ul>
    </div>`
  );
  root.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const source = fd.get("source");
    state.todos.unshift({
      id: "t" + Date.now(),
      title: String(fd.get("title") || "").trim(),
      source,
      due: "今日",
      done: false,
      wecom: source === "wecom"
    });
    saveState(state);
    render();
  };
  root.querySelectorAll("[data-id]").forEach((box) => {
    box.onchange = () => {
      const item = state.todos.find((t) => t.id === box.dataset.id);
      if (item) item.done = box.checked;
      saveState(state);
      render();
    };
  });
  root.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = () => {
      state.todos = state.todos.filter((t) => t.id !== btn.dataset.del);
      saveState(state);
      render();
    };
  });
}

function renderPapers(root) {
  const state = loadState();
  root.innerHTML = layout(
    "底稿",
    "第 0 期只在浏览器里登记文件名，不上传到服务器。",
    `<div class="card">
      <input type="file" id="paper-file" multiple />
      <div class="papers" style="margin-top:12px">
        ${
          state.papers.length
            ? state.papers
                .map(
                  (p) =>
                    `<div class="paper-item"><div><b>${p.name}</b><div class="muted">${Math.round(p.size / 1024)} KB · ${p.at}</div></div><span class="tag">本地登记</span></div>`
                )
                .join("")
            : `<p class="muted">还没有底稿。可先登记 Excel / PDF 文件名。</p>`
        }
      </div>
    </div>`
  );
  root.querySelector("#paper-file").onchange = (e) => {
    const files = [...e.target.files];
    files.forEach((f) => {
      state.papers.push({
        name: f.name,
        size: f.size,
        at: new Date().toLocaleString("zh-CN", { hour12: false })
      });
    });
    saveState(state);
    render();
  };
}

function renderMail(root) {
  root.innerHTML = layout(
    "邮件 / 托管行取数",
    "本机演示不连公司邮箱。内网部署时把凭据放进 gitignore 的 config.local.json。",
    `<div class="split">
      <div class="card">
        <h3>取数说明</h3>
        <p>IMAP：mail.cmfchina.com:993。文件夹名按 config.example.json 配置。</p>
        <p class="muted">当前环境没有内网，代理会返回快照而不会登录邮箱。</p>
        <p><button id="ping">检查 5199 代理</button> <span id="ping-out" class="muted"></span></p>
      </div>
      <div class="card">
        <h3>Coremail 演示</h3>
        <iframe class="source" src="./source.html?sys=mail" title="Coremail 演示"></iframe>
      </div>
    </div>`
  );
  root.querySelector("#ping").onclick = async () => {
    const out = root.querySelector("#ping-out");
    try {
      const res = await fetch("http://127.0.0.1:5199/health");
      const data = await res.json();
      out.textContent = data.ok ? "代理在线，模式：" + data.mode : "代理异常";
    } catch (e) {
      out.textContent = "未启动代理，工作台仍可读 data/ 快照";
    }
  };
}

function renderMap(root) {
  const state = loadState();
  root.innerHTML = layout(
    "系统映射",
    "把 SYS 里的内网地址填到这里。空着则跳转本包演示页。",
    `<div class="card">
      <form id="sys-form" class="papers">
        ${["km", "risk", "supervise", "mail"]
          .map((k) => {
            const label = { km: "KM 签报", risk: "风控 / 限制池", supervise: "聚升", mail: "Coremail" }[k];
            return `<label>${label}<br/><input name="${k}" value="${state.sys[k] || ""}" style="width:100%;margin-top:6px" /></label>`;
          })
          .join("")}
        <button class="primary" type="submit">保存映射</button>
      </form>
    </div>`
  );
  root.querySelector("#sys-form").onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.sys = {
      km: String(fd.get("km") || DEFAULT_SYS.km),
      risk: String(fd.get("risk") || DEFAULT_SYS.risk),
      supervise: String(fd.get("supervise") || DEFAULT_SYS.supervise),
      mail: String(fd.get("mail") || DEFAULT_SYS.mail)
    };
    saveState(state);
    render();
  };
}

async function render() {
  const root = document.getElementById("app");
  root.innerHTML = layout("加载中", "读取快照…", `<div class="card">正在打开工作台。</div>`);
  let data;
  try {
    const [jush, cash, liquid] = await Promise.all([
      fetchJSON("jush_data.json"),
      fetchJSON("cash_raw.json"),
      fetchJSON("liquid_raw.json")
    ]);
    data = { jush, cash, liquid };
  } catch (e) {
    root.innerHTML = layout("无法读取快照", e.message, `<div class="card">请用 python3 serve.py 5175 启动，不要直接双击 html。</div>`);
    return;
  }
  const r = route();
  if (r.startsWith("/monitor")) renderMonitor(root, data);
  else if (r.startsWith("/todos")) renderTodos(root);
  else if (r.startsWith("/papers")) renderPapers(root);
  else if (r.startsWith("/mail")) renderMail(root);
  else if (r.startsWith("/map")) renderMap(root);
  else renderHome(root, data);
}

window.addEventListener("hashchange", render);
if (!localStorage.getItem(STORE_KEY)) restoreDemo(true);
render();
