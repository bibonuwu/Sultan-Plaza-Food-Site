@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Sultan Plaza - деплой админ-панели

rem ============================================================
rem  Деплой админ-панели Sultan Plaza в Firebase
rem   - App Hosting  : сайт qradminsite (React)
rem   - Firestore    : правила безопасности и индексы
rem   - Functions    : push-уведомления о новых заказах
rem ============================================================

set "PROJECT=sultanplaza"
set "BACKEND=sultan-admin"
set "REGION=europe-west4"
set "WEBAPP_ID=1:306909596934:web:43cadd19098ef33af3e287"

where node >nul 2>nul || goto :no_node
where firebase >nul 2>nul || goto :no_firebase

:menu
cls
echo.
echo  ==========================================================
echo     SULTAN PLAZA  -  деплой админ-панели заказов
echo     Проект Firebase: %PROJECT%     Бэкенд: %BACKEND%
echo  ==========================================================
echo.
echo    1. Полный деплой: правила + уведомления + сайт  [рекомендуется]
echo    2. Только сайт  [App Hosting]
echo    3. Только правила и индексы Firestore
echo    4. Только Cloud Functions  [push-уведомления]
echo    5. Показать адрес сайта
echo    6. Войти в аккаунт Firebase
echo    7. Запустить локально для проверки
echo    0. Выход
echo.
set "CHOICE="
set /p "CHOICE=  Выберите пункт [1]: "
if "%CHOICE%"=="" set "CHOICE=1"

if "%CHOICE%"=="1" goto :full
if "%CHOICE%"=="2" goto :site
if "%CHOICE%"=="3" goto :rules
if "%CHOICE%"=="4" goto :functions
if "%CHOICE%"=="5" goto :url
if "%CHOICE%"=="6" goto :login
if "%CHOICE%"=="7" goto :dev
if "%CHOICE%"=="0" goto :eof
goto :menu

rem ------------------------------------------------------------
:full
call :ensure_login || goto :fail
call :build_site || goto :fail
call :prepare_functions || goto :fail
echo.
echo  [deploy 1/3] Правила и индексы Firestore...
call firebase deploy --only firestore --project %PROJECT%
if errorlevel 1 goto :fail
call :deploy_site || goto :fail
call :deploy_functions || goto :fail_functions
goto :done

:site
call :ensure_login || goto :fail
call :build_site || goto :fail
call :deploy_site || goto :fail
goto :done

:rules
call :ensure_login || goto :fail
echo.
echo  [deploy] Правила и индексы Firestore...
call firebase deploy --only firestore --project %PROJECT%
if errorlevel 1 goto :fail
goto :done

:functions
call :ensure_login || goto :fail
call :prepare_functions || goto :fail
call :deploy_functions || goto :fail_functions
goto :done

:url
call firebase apphosting:backends:list --project %PROJECT%
echo.
pause
goto :menu

:login
call firebase login
echo.
pause
goto :menu

:dev
if not exist "node_modules" call npm ci
if errorlevel 1 goto :fail
echo.
echo  Откройте http://localhost:5173  -  остановить: Ctrl+C
call npm run dev
goto :menu

rem ------------------------------------------------------------
:ensure_login
call firebase projects:list >nul 2>nul
if not errorlevel 1 exit /b 0
echo.
echo  Нужно войти в аккаунт Google, у которого есть доступ к проекту %PROJECT%.
call firebase login
exit /b %errorlevel%

:build_site
echo.
echo  [1/3] Установка зависимостей сайта...
if not exist "node_modules" (
  call npm ci
  if errorlevel 1 exit /b 1
)
echo  [2/3] Проверка сборки сайта...
call npm run build
if errorlevel 1 (
  echo  Сборка завершилась с ошибкой - деплой отменён.
  exit /b 1
)
exit /b 0

:prepare_functions
echo  [3/3] Установка зависимостей Cloud Functions...
pushd functions
if not exist "node_modules" (
  call npm ci
  if errorlevel 1 (
    popd
    exit /b 1
  )
)
popd
exit /b 0

:ensure_backend
rem Создаём бэкенд App Hosting без вопросов, если его ещё нет
firebase apphosting:backends:list --project %PROJECT% --json 2>nul | findstr /c:"/backends/%BACKEND%" >nul
if not errorlevel 1 exit /b 0
echo.
echo  [deploy] Создаю бэкенд App Hosting "%BACKEND%" в регионе %REGION%...
call firebase apphosting:backends:create --backend %BACKEND% --primary-region %REGION% --app %WEBAPP_ID% --non-interactive --project %PROJECT%
exit /b %errorlevel%

:deploy_site
call :ensure_backend || exit /b 1
echo.
echo  [deploy 2/3] Сайт в App Hosting - сборка в облаке занимает 3-6 минут...
call firebase deploy --only apphosting --project %PROJECT%
exit /b %errorlevel%

:deploy_functions
rem Первый деплой функций 2-го поколения часто падает, пока Google выдаёт
rem права сервису Eventarc. Поэтому до 3 попыток с паузой 2 минуты.
set /a FN_TRY=0
:deploy_functions_try
set /a FN_TRY+=1
echo.
echo  [deploy 3/3] Cloud Functions - попытка %FN_TRY% из 3...
call firebase deploy --only functions --project %PROJECT%
if not errorlevel 1 exit /b 0
if %FN_TRY% GEQ 3 exit /b 1
echo.
echo  Это нормально при первом запуске: Google ещё выдаёт права сервису Eventarc.
echo  Ждём 2 минуты и пробуем снова...
timeout /t 120 /nobreak >nul 2>nul || ping -n 121 127.0.0.1 >nul
goto :deploy_functions_try

rem ------------------------------------------------------------
:done
echo.
echo  ==========================================================
echo     Готово!  Адрес сайта - в выводе выше  [*.hosted.app]
echo     или пункт 5 в меню.
echo  ==========================================================
echo.
pause
goto :menu

:fail_functions
echo.
echo  !!! Cloud Functions пока не создались.
echo      Сайт и приём заказов работают и без них - не хватает только push-уведомлений.
echo      Подождите 5-10 минут и выберите пункт 4 в меню.
echo.
pause
goto :menu

:fail
echo.
echo  !!! Произошла ошибка. Прочитайте сообщение выше.
echo      Частые причины: нет входа в Firebase, нет интернета,
echo      проект не на тарифе Blaze - нужен для App Hosting и Functions.
echo.
pause
goto :menu

:no_node
echo  Node.js не найден. Установите LTS-версию с https://nodejs.org и перезапустите.
pause
exit /b 1

:no_firebase
echo  Firebase CLI не найден. Установите командой:
echo      npm install -g firebase-tools
pause
exit /b 1
