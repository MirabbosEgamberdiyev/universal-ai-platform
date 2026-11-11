@echo off
echo ==============================================================================
echo [NovaSphere AI] Konteynerlarni to'xtatish...
echo ==============================================================================
cd /d "%~dp0"

docker compose down

echo [Natija] Barcha konteynerlar muvaffaqiyatli to'xtatildi.
pause
