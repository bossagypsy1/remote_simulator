@echo off
title LOCAL - localhost:9009
cd /d C:\Users\zebedee\Desktop\claud\remote_simulator
set "INGEST_URL=http://localhost:9009/api/ingest"
npm run dev -- --all
pause
