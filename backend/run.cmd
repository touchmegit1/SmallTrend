@echo off
setlocal
echo ================================
echo   Starting SmallTrend Backend
echo ================================
echo.

cd /d %~dp0

if exist ".env" (
	echo [INFO] Loading environment from .env
	for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
		if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
	)
)

if not exist ".env" (
	echo [WARN] .env not found. Starting with file-based H2 fallback profile.
	set "DB_URL=jdbc:h2:file:./.data/smalltrend;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;AUTO_SERVER=TRUE"
	set "DB_USERNAME=sa"
	set "DB_PASSWORD="
	set "SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver"
	set "SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect"
	set "SPRING_JPA_DDL_AUTO=update"
	set "SPRING_SQL_INIT_MODE=never"
)

set "SPRING_JPA_DDL_AUTO=update"
set "SPRING_SQL_INIT_MODE=never"

set "APP_PORT=%SERVER_PORT%"
if not defined APP_PORT set "APP_PORT=8081"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%APP_PORT% .*LISTENING"') do (
	echo [WARN] Port %APP_PORT% is in use by PID %%P. Stopping old process...
	taskkill /PID %%P /F >nul 2>nul
)

call mvnw.cmd spring-boot:run
