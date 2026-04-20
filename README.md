# Remote Simulator

CLI tool that simulates environmental devices sending sensor data to the ingestion API.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set INGEST_URL
```

## Usage

```bash
# All devices, one round
npm run dev -- --all --count 1

# Single device, one round
npm run dev -- --device env-001 --count 1

# All devices, 10 rounds
npm run dev -- --all --count 10

# All devices, continuous (Ctrl+C to stop)
npm run dev -- --all

# Custom interval (ms)
npm run dev -- --all --interval 10000

# Dry run (no HTTP — prints payload)
npm run dev -- --all --count 1 --dry-run

# Verbose (full request/response detail)
npm run dev -- --all --count 1 --verbose
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--device <id>` | — | Simulate a single device |
| `--all` | — | Simulate all 6 devices |
| `--count <n>` | 0 | Number of rounds (0 = continuous) |
| `--interval <ms>` | 30000 | Base push interval in milliseconds |
| `--dry-run` | false | Print payload, skip HTTP |
| `--verbose` | false | Print full JSON and response details |

## Devices

| ID | Base Lat | Base Lon |
|----|----------|----------|
| env-001 | 53.3317 | -3.0592 |
| env-002 | 53.3340 | -3.0650 |
| env-003 | 53.3290 | -3.0530 |
| env-004 | 53.3360 | -3.0710 |
| env-005 | 53.3270 | -3.0480 |
| env-006 | 53.3380 | -3.0560 |

## Sensor Model

Each device sends 6 readings per request. `sensorLocalId` is scoped to the device — not global.

| sensorLocalId | Name | Range |
|--------------|------|-------|
| 1 | latitude | base ± ~111 m |
| 2 | longitude | base ± ~111 m |
| 3 | temperature | 10 – 22 °C |
| 4 | pressure | 1000 – 1025 hPa |
| 5 | humidity | 50 – 90 % |
| 6 | acidity | 6.5 – 8.5 pH |

Sensor values drift gradually over time for realistic time-series data.

## Payload Format

```json
{
  "deviceId": "env-001",
  "messageId": 1,
  "timestamp": "2026-03-20T10:00:00.000Z",
  "payload": [
    { "sensorLocalId": 1, "name": "latitude",    "value": 53.331842 },
    { "sensorLocalId": 2, "name": "longitude",   "value": -3.059317 },
    { "sensorLocalId": 3, "name": "temperature", "value": 16.4 },
    { "sensorLocalId": 4, "name": "pressure",    "value": 1012.8 },
    { "sensorLocalId": 5, "name": "humidity",    "value": 68.3 },
    { "sensorLocalId": 6, "name": "acidity",     "value": 7.42 }
  ]
}
```

## Log Output

```
Simulating: env-001, env-002, env-003, env-004, env-005, env-006
Mode: continuous | Interval: 30000ms ± up to 5s jitter
Press Ctrl+C to stop.

[10:00:00] env-001 messageId=1 sent 6 readings -> 200 OK
[10:00:00] env-002 messageId=1 sent 6 readings -> 200 OK
[10:00:00] env-003 messageId=1 -> ERROR 500 Internal Server Error
           Body: {"error":"sensor not found"}
```

## Requirements

- Node.js 18+ (uses built-in `fetch`)
