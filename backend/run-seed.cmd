@echo off
setlocal
echo ==============================================
echo   Starting SmallTrend Backend (SEED MODE)
echo ==============================================
echo [WARN] Seed mode will recreate schema and reload data.sql
echo.

cd /d %~dp0

if exist ".env" (
	echo [INFO] Loading environment from .env
	for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
		if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
	)
)

set "APP_PORT=%SERVER_PORT%"
if not defined APP_PORT set "APP_PORT=8081"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%APP_PORT% .*LISTENING"') do (
	echo [WARN] Port %APP_PORT% is in use by PID %%P. Stopping old process...
	taskkill /PID %%P /F >nul 2>nul
)

set "SPRING_PROFILES_ACTIVE=seed"
set "SPRING_JPA_DDL_AUTO=create-drop"
set "SPRING_SQL_INIT_MODE=always"
call mvnw.cmd spring-boot:run
