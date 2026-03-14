@echo off
setlocal
chcp 65001 >nul

echo ==============================================
echo   SmallTrend MySQL Seed (SEED ONLY)
echo ==============================================
echo [INFO] This script only seeds MySQL database.
echo [INFO] Backend will NOT be started.
echo.

cd /d %~dp0

if exist ".env" (
	echo [INFO] Loading environment from .env
	for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
		if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
	)
)

set "DB_HOST=%DB_HOST%"
if not defined DB_HOST set "DB_HOST=localhost"

set "DB_PORT=%DB_PORT%"
if not defined DB_PORT set "DB_PORT=3306"

set "DB_NAME=%DB_NAME%"
if not defined DB_NAME set "DB_NAME=smalltrend"

set "DB_USERNAME=%DB_USERNAME%"
if not defined DB_USERNAME set "DB_USERNAME=root"

set "DB_PASSWORD=%DB_PASSWORD%"
if not defined DB_PASSWORD set "DB_PASSWORD=1234"

set "SEED_FILE=src\main\resources\data.sql"

if not exist "%SEED_FILE%" (
	echo [ERROR] Seed file not found: %SEED_FILE%
	exit /b 1
)

set "MYSQL_EXE=mysql"
where mysql >nul 2>nul
if errorlevel 1 (
	set "MYSQL_EXE="
	if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
	if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe"
	if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe"
	if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe"
	if not defined MYSQL_EXE if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
	if not defined MYSQL_EXE if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"
)

if not defined MYSQL_EXE (
	echo [ERROR] mysql CLI not found.
	echo [HINT] Add mysql.exe to PATH or install MySQL client.
	echo [HINT] You can also install XAMPP MySQL at C:\xampp\mysql\bin\mysql.exe
	exit /b 1
)

echo [INFO] Target DB: %DB_NAME% at %DB_HOST%:%DB_PORT%

set "MYSQL_PWD=%DB_PASSWORD%"

"%MYSQL_EXE%" --default-character-set=utf8mb4 -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
	echo [ERROR] Failed to create/check database %DB_NAME%.
	set "MYSQL_PWD="
	exit /b 1
)

"%MYSQL_EXE%" --default-character-set=utf8mb4 -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% %DB_NAME% < "%SEED_FILE%" >nul
if errorlevel 1 (
	echo [ERROR] Failed to import seed file into %DB_NAME%.
	set "MYSQL_PWD="
	exit /b 1
)

set "MYSQL_PWD="

echo.
echo [SUCCESS] Seed completed for database %DB_NAME%.
exit /b 0
