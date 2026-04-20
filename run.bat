@echo off
set SEND_TO_URL=http://localhost:9009/api/ingest
node dist/index.js --all
pause
