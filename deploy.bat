@echo off
chcp 65001 >nul
REM =============================================
REM  DEPLOY PRODUCTION - qua GitHub
REM  PC (build) -> GitHub (push) -> Server (pull)
REM =============================================
REM  Repo:   https://github.com/hoangnmr/berth-planning.git
REM  Server: 103.72.98.102:24700 (root)
REM  Path:   /var/www/ttport/planner
REM  URL:    https://planner.ttport.vn/
REM =============================================

set REPO=https://github.com/hoangnmr/berth-planning.git
set SERVER=103.72.98.102
set PORT=24700
set USER=root
set REMOTE_PATH=/var/www/ttport/planner

echo.
echo  ============================================
echo   DEPLOY PRODUCTION - Berth Planner
echo   PC -^> GitHub -^> Server
echo  ============================================
echo.

REM === Kiem tra tools ===
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Git chua cai dat!
    pause
    exit /b 1
)
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Node.js chua cai dat!
    pause
    exit /b 1
)
where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] SSH chua cai dat!
    pause
    exit /b 1
)

REM === BUOC 1: Build production ===
echo [1/4] Build production...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Build that bai!
    pause
    exit /b 1
)
echo.
echo   Build thanh cong!
echo.

REM === BUOC 2: Commit code + build len GitHub ===
echo [2/4] Push len GitHub...
echo.

REM Kiem tra git init
if not exist ".git" (
    git init
    git remote add origin %REPO%
)

REM Kiem tra remote
git remote -v | findstr "hoangnmr/berth-planning" >nul 2>nul
if %errorlevel% neq 0 (
    git remote remove origin 2>nul
    git remote add origin %REPO%
)

REM Nhap commit message
set /p "msg=Commit message (Enter = auto): "
if "%msg%"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
    set "msg=deploy: !dt:~0,4!-!dt:~4,2!-!dt:~6,2! !dt:~8,2!:!dt:~10,2!:!dt:~12,2!"
)

git add -A
git commit -m "%msg%"
if %errorlevel% neq 0 (
    echo   Khong co thay doi moi de commit, tiep tuc push...
)

REM Force push - PC la source of truth
git push --force -u origin main
if %errorlevel% neq 0 (
    echo Dang thu branch master...
    git branch -M main
    git push --force -u origin main
    if %errorlevel% neq 0 (
        echo [LOI] Push that bai! Kiem tra lai git credentials.
        pause
        exit /b 1
    )
)
echo.
echo   Push GitHub thanh cong!
echo.

REM === BUOC 3: Server pull tu GitHub va deploy ===
echo [3/4] Deploy tren server...
echo.

ssh -p %PORT% %USER%@%SERVER% "git config --global --add safe.directory %REMOTE_PATH% 2>/dev/null; cd %REMOTE_PATH% && echo '--- Pull code tu GitHub ---' && git fetch origin main && git reset --hard origin/main && echo '--- Copy build ra thu muc serve ---' && cp -rf build/* . && echo '--- Xong! ---' && echo '' && echo '--- Files tren server ---' && ls -la && echo '' && du -sh ."

if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Khong the pull. Thu khoi tao git tren server lan dau...
    ssh -p %PORT% %USER%@%SERVER% "git config --global --add safe.directory %REMOTE_PATH%; mkdir -p %REMOTE_PATH% && cd %REMOTE_PATH% && git init && git remote add origin %REPO% && git fetch origin main && git checkout -f main && cp -rf build/* . && echo 'Init thanh cong!' && ls -la"
    if %errorlevel% neq 0 (
        echo [LOI] Deploy that bai!
        pause
        exit /b 1
    )
)

echo.
echo   Deploy server thanh cong!
echo.

REM === BUOC 4: Kiem tra ===
echo [4/4] Kiem tra ket qua...
echo.
echo   GitHub:  https://github.com/hoangnmr/berth-planning
echo   Server:  %REMOTE_PATH%
echo   URL:     https://planner.ttport.vn/
echo.
echo  ============================================
echo   DEPLOY HOAN TAT!
echo   Truy cap: https://planner.ttport.vn/
echo  ============================================
echo.
pause
