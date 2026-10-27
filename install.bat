@echo off
REM Installs everything for BizLocate (Windows). Double-click this file.
echo == Installing server packages ==
cd server
call npm install
if not exist .env copy .env.example .env
cd ..
echo == Installing client packages ==
cd client
call npm install
cd ..
echo.
echo Done. Start MongoDB, then:
echo   Terminal 1:  cd server  and run:  npm run seed   then   npm run dev
echo   Terminal 2:  cd client  and run:  npm run dev
pause
