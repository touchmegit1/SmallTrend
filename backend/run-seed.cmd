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

set "SPRING_PROFILES_ACTIVE=seed"
call mvnw.cmd spring-boot:run
