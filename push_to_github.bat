@echo off
echo Preparing to push Traveloop to GitHub...
echo.

:: Set path to the portable Git we downloaded
set BASE_DIR=%~dp0
set PATH=%BASE_DIR%..\..\mingit\cmd;%PATH%

:: Push to remote
echo Pushing to https://github.com/Vector3451/ODOOXKAHE.git ...
echo (If prompted, please enter your GitHub Username and Personal Access Token)
echo.

git push -u origin main

echo.
pause
