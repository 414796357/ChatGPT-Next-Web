投监工作台 · 第 0 期可点击原型
==============================

本目录按迁移底稿重建，方便换电脑后继续改。
换电脑不会自动取 KM / 聚升 / 邮件，也不要在仓库里提交那些系统的密码。

一、怎么启动

  1. 不要只拷单个 html，请保留整个 workbench 文件夹
  2. Mac / Linux：双击 start-workbench.command，或在本目录执行
        python3 serve.py 5175
  3. Windows：双击 start-workbench.bat
  4. 浏览器打开 http://127.0.0.1:5175/

二、页面

  主页      http://127.0.0.1:5175/#/home
  聚升监控  http://127.0.0.1:5175/#/monitor
  待办      http://127.0.0.1:5175/#/todos
  底稿      http://127.0.0.1:5175/#/papers
  邮件取数  http://127.0.0.1:5175/#/mail

三、注意

  · 地址必须是这台电脑自己的 127.0.0.1
  · 关掉终端，服务就停
  · 待办在浏览器 localStorage（键 supervise-workbench-v13）
  · 聚升监控先读本包 data/ 快照；内网取数需另开 5199 代理
  · 凭据只放 config.local.json / ia_cred.local.json，不要提交仓库
