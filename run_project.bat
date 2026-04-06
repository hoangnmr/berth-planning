@echo off
REM Script chay du an React (khong cai dat lai thu vien)

REM Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js chua duoc cai. Dang mo trang tai Node.js...
    start https://nodejs.org
    pause
    exit /b
)

REM Chay du an
npm start
