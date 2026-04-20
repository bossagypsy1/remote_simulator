@echo off
title CLOUD - Vercel
cd /d C:\Users\zebedee\Desktop\claud\remote_simulator
set "INGEST_URL=https://remote-sensor-phone.vercel.app/api/ingest"
npm run dev -- --all
pause
