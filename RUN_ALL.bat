@echo off
cd /d "%~dp0"
echo Starting Syntra frontend, Express API, and Telegram bot worker...
npm run dev:all
