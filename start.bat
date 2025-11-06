@echo off
echo.
echo    ================================================
echo          DANG KHOI DONG MAY CHU (WEB SERVER)
echo    ================================================
echo.
echo    Mo trinh duyet (Chrome, Firefox...) va truy cap:
echo.
echo          http://localhost:8000
echo.
echo    (Nhan Ctrl+C de tat may chu khi xong)
echo.

:: Lệnh này khởi động một máy chủ web đơn giản bằng Python 3
python -m http.server 8000

pause