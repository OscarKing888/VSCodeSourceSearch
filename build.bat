@echo off
echo Building VSCode Source Search Extension...

REM Set up local Node.js environment
if not exist "nodejs" (
    echo Downloading Node.js...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip' -OutFile 'nodejs.zip'"
    powershell -Command "Expand-Archive -Path 'nodejs.zip' -DestinationPath '.' -Force"
    move "node-v20.11.1-win-x64" "nodejs"
    del "nodejs.zip"
)

REM Set PATH to use local Node.js
set PATH=%CD%\nodejs;%PATH%

REM Check Node.js version
for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
echo Current Node.js version: %NODE_VERSION%

REM Check if Node.js version is sufficient (>= 20)
for /f "tokens=1 delims=." %%a in ("%NODE_VERSION%") do set MAJOR_VERSION=%%a
set MAJOR_VERSION=%MAJOR_VERSION:~1%

if %MAJOR_VERSION% LSS 20 (
    echo Error: Node.js version 20 or higher is required
    echo Please update Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Clean previous build
echo Cleaning previous build...
if exist "out" rmdir /s /q "out"
if exist "*.vsix" del "*.vsix"

REM Install dependencies
echo Installing dependencies...
call npm install

REM Install vsce locally
echo Installing vsce...
call npm install -g @vscode/vsce

REM Compile TypeScript
echo Compiling TypeScript...
call npm run compile

REM Package extension
echo Packaging extension...
call vsce package

REM Check if package was created
if exist "*.vsix" (
    echo.
    echo Build successful!
    echo Extension package created: %cd%\*.vsix
) else (
    echo.
    echo Build failed!
)

pause 