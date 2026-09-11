@echo off
setlocal EnableExtensions DisableDelayedExpansion
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

set "SEED_FILE=..\deploy\fix_seed.sql"
if not exist "%SEED_FILE%" set "SEED_FILE=src\main\resources\data.sql"

if not exist "%SEED_FILE%" (
	echo [ERROR] Seed file not found: %SEED_FILE%
	exit /b 1
)

findstr /C:"DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS" "%SEED_FILE%" >nul 2>nul
if not errorlevel 1 (
	echo [ERROR] Seed file contains legacy mock patch block and is not allowed.
	echo [HINT] Regenerate deploy\fix_seed.sql using: node deploy\gen_fix_seed.js
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
echo [INFO] Seed file: %SEED_FILE%

set "MYSQL_PWD=%DB_PASSWORD%"

"%MYSQL_EXE%" --default-character-set=utf8mb4 -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
	echo [ERROR] Failed to create/check database %DB_NAME%.
	set "MYSQL_PWD="
	exit /b 1
)

"%MYSQL_EXE%" --default-character-set=utf8mb4 -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% %DB_NAME% < "%SEED_FILE%"
if errorlevel 1 (
	echo [ERROR] Failed to import seed file into %DB_NAME%.
	set "MYSQL_PWD="
	exit /b 1
)

call :query_scalar "SELECT COUNT(*) FROM users;" USERS_COUNT
call :query_scalar "SELECT COUNT(*) FROM products;" PRODUCTS_COUNT
call :query_scalar "SELECT COUNT(*) FROM product_variants;" VARIANTS_COUNT
call :query_scalar "SELECT COUNT(*) FROM inventory_stock;" STOCK_COUNT
call :query_scalar "SELECT COUNT(*) FROM sale_orders;" SALE_ORDERS_COUNT
call :query_scalar "SELECT COUNT(*) FROM sale_order_items;" SALE_ORDER_ITEMS_COUNT
call :query_scalar "SELECT COUNT(*) FROM sale_order_histories;" SALE_ORDER_HISTORIES_COUNT
call :query_scalar "SELECT COUNT(*) FROM tickets;" TICKETS_COUNT
call :query_scalar "SELECT COUNT(*) FROM tickets WHERE ticket_type = 'SHIFT_CHANGE';" SHIFT_CHANGE_TICKETS_COUNT
call :query_scalar "SELECT COUNT(*) FROM loyalty_gifts;" LOYALTY_GIFTS_COUNT
call :query_scalar "SELECT COUNT(*) FROM advertisements WHERE is_active = 1;" ACTIVE_ADVERTISEMENTS_COUNT
call :query_scalar "SELECT COUNT(*) FROM product_variants pv LEFT JOIN products p ON p.id = pv.product_id LEFT JOIN units u ON u.id = pv.unit_id WHERE p.id IS NOT NULL AND u.id IS NOT NULL;" JOINABLE_VARIANTS_COUNT
call :query_scalar "SELECT COUNT(*) FROM product_variants pv LEFT JOIN products p ON p.id = pv.product_id WHERE p.id IS NULL;" ORPHAN_PRODUCT_REFS
call :query_scalar "SELECT COUNT(*) FROM product_variants pv LEFT JOIN units u ON u.id = pv.unit_id WHERE u.id IS NULL;" ORPHAN_UNIT_REFS
call :query_scalar "SELECT COUNT(DISTINCT variant_id) FROM inventory_stock WHERE COALESCE(quantity, 0) > 0;" STOCKED_VARIANTS_COUNT

if not defined USERS_COUNT set "USERS_COUNT=0"
if not defined PRODUCTS_COUNT set "PRODUCTS_COUNT=0"
if not defined VARIANTS_COUNT set "VARIANTS_COUNT=0"
if not defined STOCK_COUNT set "STOCK_COUNT=0"
if not defined SALE_ORDERS_COUNT set "SALE_ORDERS_COUNT=0"
if not defined SALE_ORDER_ITEMS_COUNT set "SALE_ORDER_ITEMS_COUNT=0"
if not defined SALE_ORDER_HISTORIES_COUNT set "SALE_ORDER_HISTORIES_COUNT=0"
if not defined TICKETS_COUNT set "TICKETS_COUNT=0"
if not defined SHIFT_CHANGE_TICKETS_COUNT set "SHIFT_CHANGE_TICKETS_COUNT=0"
if not defined LOYALTY_GIFTS_COUNT set "LOYALTY_GIFTS_COUNT=0"
if not defined ACTIVE_ADVERTISEMENTS_COUNT set "ACTIVE_ADVERTISEMENTS_COUNT=0"
if not defined JOINABLE_VARIANTS_COUNT set "JOINABLE_VARIANTS_COUNT=0"
if not defined ORPHAN_PRODUCT_REFS set "ORPHAN_PRODUCT_REFS=0"
if not defined ORPHAN_UNIT_REFS set "ORPHAN_UNIT_REFS=0"
if not defined STOCKED_VARIANTS_COUNT set "STOCKED_VARIANTS_COUNT=0"

echo [INFO] Seed verification counts:
echo        users=%USERS_COUNT%, products=%PRODUCTS_COUNT%, variants=%VARIANTS_COUNT%, inventory_stock=%STOCK_COUNT%
echo        sale_orders=%SALE_ORDERS_COUNT%, sale_order_items=%SALE_ORDER_ITEMS_COUNT%, sale_order_histories=%SALE_ORDER_HISTORIES_COUNT%, tickets=%TICKETS_COUNT%, loyalty_gifts=%LOYALTY_GIFTS_COUNT%
echo        shift_change_tickets=%SHIFT_CHANGE_TICKETS_COUNT%, active_advertisements=%ACTIVE_ADVERTISEMENTS_COUNT%
echo        joinable_variants=%JOINABLE_VARIANTS_COUNT%, orphan_product_refs=%ORPHAN_PRODUCT_REFS%, orphan_unit_refs=%ORPHAN_UNIT_REFS%, stocked_variants=%STOCKED_VARIANTS_COUNT%

if "%USERS_COUNT%"=="0" goto :seed_invalid
if "%PRODUCTS_COUNT%"=="0" goto :seed_invalid
if "%VARIANTS_COUNT%"=="0" goto :seed_invalid
if "%STOCK_COUNT%"=="0" goto :seed_invalid
if "%SALE_ORDERS_COUNT%"=="0" goto :seed_invalid
if "%SALE_ORDER_ITEMS_COUNT%"=="0" goto :seed_invalid
if "%SALE_ORDER_HISTORIES_COUNT%"=="0" goto :seed_invalid
if "%TICKETS_COUNT%"=="0" goto :seed_invalid
if "%SHIFT_CHANGE_TICKETS_COUNT%"=="0" goto :seed_invalid
if "%LOYALTY_GIFTS_COUNT%"=="0" goto :seed_invalid
if "%ACTIVE_ADVERTISEMENTS_COUNT%"=="0" goto :seed_invalid
if "%JOINABLE_VARIANTS_COUNT%"=="0" goto :seed_invalid
if not "%ORPHAN_PRODUCT_REFS%"=="0" goto :seed_invalid
if not "%ORPHAN_UNIT_REFS%"=="0" goto :seed_invalid
if "%STOCKED_VARIANTS_COUNT%"=="0" goto :seed_invalid

set "MYSQL_PWD="

echo.
echo [SUCCESS] Seed completed for database %DB_NAME%.
exit /b 0

:query_scalar
setlocal
set "QUERY=%~1"
set "OUT_VAR=%~2"
set "TMP_FILE=%TEMP%\smalltrend_seed_%RANDOM%_%RANDOM%.tmp"

"%MYSQL_EXE%" --default-character-set=utf8mb4 -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% -N -s %DB_NAME% -e "%QUERY%" > "%TMP_FILE%" 2>nul
if errorlevel 1 (
	if exist "%TMP_FILE%" del "%TMP_FILE%" >nul 2>nul
	endlocal & set "%~2=0"
	goto :eof
)

set "VALUE="
if exist "%TMP_FILE%" set /p VALUE=<"%TMP_FILE%"
if exist "%TMP_FILE%" del "%TMP_FILE%" >nul 2>nul
if not defined VALUE set "VALUE=0"

endlocal & set "%~2=%VALUE%"
goto :eof

:seed_invalid
echo [ERROR] Seed completed but validation failed. Database is inconsistent.
set "MYSQL_PWD="
exit /b 1
