@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "算力集原型服务" /min py -3 server.py
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "算力集原型服务" /min python server.py
  ) else (
    echo 未检测到 Python，将直接打开静态原型。
    start "" index.html
    pause
    exit /b 0
  )
)
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4173
