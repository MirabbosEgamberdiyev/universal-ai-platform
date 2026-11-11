@echo off
echo ==============================================================================
echo [Universal AI Platform] Docker orqali platformani ishga tushirish...
echo ==============================================================================
cd /d "%~dp0"

docker compose up -d

echo.
echo [Holat] Xizmatlar Docker konteynerlarida ishga tushirildi!
echo.
echo - Frontend Veb Ilova: http://localhost:3005
echo - Backend API:        http://localhost:8090
echo - Swagger API Doc:    http://localhost:8090/swagger-ui/index.html
echo - RabbitMQ Dashboard: http://localhost:15674
echo.
echo Admin kirish: Admin / Admin.123$
echo ==============================================================================
pause
