@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PY_CMD="
where py >nul 2>nul && set "PY_CMD=py -3"
if not defined PY_CMD (
  where python >nul 2>nul && set "PY_CMD=python"
)
if not defined PY_CMD (
  echo 未检测到 Python，无法启动局域网服务。
  pause
  exit /b 1
)
set "LAN_IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do if not defined LAN_IP set "LAN_IP=%%a"
set "LAN_IP=%LAN_IP: =%"
echo.
echo 算力集手机联调服务即将启动。
echo 请让手机与电脑连接同一 Wi-Fi，然后访问：
echo.
echo     http://%LAN_IP%:4173
echo.
echo 如果 Windows 防火墙询问，请仅允许“专用网络”。按 Ctrl+C 可停止服务。
echo.
%PY_CMD% server.py --host 0.0.0.0 --port 4173
