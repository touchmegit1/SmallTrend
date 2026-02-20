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
	echo [WARN] .env not found. Starting with in-memory H2 fallback profile.
	set "DB_URL=jdbc:h2:mem:smalltrend;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE"
	set "DB_USERNAME=sa"
	set "DB_PASSWORD="
	set "SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver"
	set "SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect"
	set "SPRING_JPA_DDL_AUTO=create-drop"
	set "SPRING_SQL_INIT_MODE=never"
)

if not defined SPRING_JPA_DDL_AUTO set "SPRING_JPA_DDL_AUTO=none"
if not defined SPRING_SQL_INIT_MODE set "SPRING_SQL_INIT_MODE=never"

call mvnw.cmd spring-boot:run
