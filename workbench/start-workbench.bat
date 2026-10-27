@echo off
cd /d %~dp0
start "toujian-proxy" python breach_proxy.py 5199
python serve.py 5175
