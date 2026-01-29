@echo off
echo ================================
echo   Starting SmallTrend Backend
echo ================================
echo.

cd /d %~dp0
call mvnw.cmd spring-boot:run
