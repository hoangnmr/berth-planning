@echo off
REM Script cai tat ca plugin va thu vien can thiet cho du an React

REM Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js chua duoc cai. Dang mo trang tai Node.js...
    start https://nodejs.org
    pause
    exit /b
)

REM Cai dat tat ca dependencies trong package.json
npm install

echo === Cai dat hoan tat! ===
pause
