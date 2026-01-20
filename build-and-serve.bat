@echo off
chcp 65001 >nul
REM Batch скрипт для сборки и запуска production версии
REM Использование: Двойной клик по файлу или запуск из командной строки

title Ruletka Slot Game - Build and Serve

echo.
echo ========================================
echo    🎰 RULETKA SLOT GAME
echo    Production Build ^& Serve
echo ========================================
echo.

REM Проверка node_modules
if not exist "node_modules" (
    echo ⚠️  node_modules не найден. Устанавливаем зависимости...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Ошибка при установке зависимостей!
        echo.
        pause
        exit /b 1
    )
)

REM Сборка
echo 📦 Шаг 1/3: Сборка production версии...
echo.
call npm run build:prod

if errorlevel 1 (
    echo.
    echo ❌ Ошибка при сборке проекта!
    echo Проверьте ошибки выше.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Сборка завершена успешно!
echo.

REM Запуск backend после старта сервера
echo ▶️  Запуск main.exe...
start "" main.exe

REM Информация
echo 📊 Шаг 2/3: Сборка завершена
echo.
if exist "dist" (
    echo    📁 Файлы сохранены в папке dist/
    echo.
)

REM Запуск сервера
echo 🚀 Шаг 3/3: Запуск локального сервера...
echo.
echo    📍 Адрес: http://localhost:4173
echo    🔌 Порт: 4173
echo.
echo    ⚠️  Нажмите Ctrl+C для остановки сервера
echo.
echo ========================================
echo.

REM Открываем браузер через 3 секунды в фоне
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:4173"

REM Запускаем preview сервер
call npm run preview:prod

echo.
echo 👋 Сервер остановлен. До свидания!
echo.
pause

