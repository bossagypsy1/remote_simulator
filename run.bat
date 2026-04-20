@echo off
set INGEST_URL=http://localhost:9009/api/ingest
node dist/index.js --all
pause
