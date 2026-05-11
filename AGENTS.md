# AGENTS.md

## Generic agent instructions

Before making changes:

- Read `CLAUDE.md` first if it exists.
- Check `git status` and inspect any existing diffs.
- Preserve the existing architecture unless explicitly asked to redesign it.
- Make the smallest safe change that satisfies the task.
- Do not overwrite user changes or unrelated agent changes.
- Inspect only the files needed for the task.
- Run relevant tests when practical, or explain why they were not run.
- Keep branding, UX direction, and product decisions consistent with existing repo guidance.

---

## Repo overview

Remote Simulator is a Vercel-hosted static frontend + serverless API that generates fake sensor payloads and POSTs them to a Remote Sensor Dashboard ingest endpoint. It exists purely for testing and demonstration — it has no database access.

- Frontend: `public/index.html` — single-page vanilla JS dashboard
- API: `api/simulate.ts` — Vercel serverless function, called by the frontend
- Device definitions: `src/devices/` — TypeScript, imported by the API
- Payload generators: `src/payloads/` — one file per device family
- Scaling: `src/utils/scaling.ts` — 4-20 mA helpers shared with payload generators

---

## Device groups

| Group | IDs | Location | Sensors (local IDs) |
|---|---|---|---|
| Wirral env | env-001…env-006 | Wirral, UK | lat(1), lon(2), temp(3), pressure(4), humidity(5), acidity(6) — 4-20 mA |
| MaasFab Rotterdam | rtm-001…rtm-003 | Rotterdam, NL | lat(1), lon(2), plus 3 custom sensors per device (IDs 3–5) |
| Garonne Components | bdx-001…bdx-003 | Bordeaux, FR | lat(1), lon(2), plus 3 custom sensors per device (IDs 3–5) |
| Fuel monitors | fuel-001…fuel-003 | Sheffield / Bristol / Norwich | tank_level(1), tank_temperature(2), tank_pressure(3) — 4-20 mA |
| Phone | phone-001 | Wirral, UK | GPS, accelerometer, gyroscope, barometer, compass, battery |

All env/rtm/bdx devices POST to `/api/ingest/miketron-device`. Fuel devices POST to the same endpoint. Phone POSTs to `/api/ingest/mobile_phone`.

---

## Custom sensors on rtm / bdx devices

Rotterdam and Bordeaux devices use `DeviceSensorConfig` (defined in `src/devices/registry.ts`) to declare device-specific sensors beyond lat/lon. The environmental payload generator (`src/payloads/environmental.ts`) reads `device.sensors` and generates drifting values for each. `sensorLocalId` values start at 3 (1 and 2 are always lat/lon).

**When adding a new rtm/bdx device or sensor**, the matching `sensor_types`, `units`, and `sensors` rows must be provisioned in `../remote_sensor_phone`. Use `scripts/seed-fuel.ts` as a template. Sensor names must match exactly — the ingest parser uses `sensorTypeName` from the payload for lookup.

---

## Scaling contract

Fuel devices send raw 4-20 mA values. The ranges in `src/utils/scaling.ts` (`FUEL_SCALING`) must match `signal_min`, `signal_max`, `value_min`, `value_max` on the corresponding `sensors` rows in the dashboard DB.

Wirral env devices also send 4-20 mA (`ENV_SCALING`). Rotterdam/Bordeaux devices send engineering values directly (no mA conversion) — their sensors should be provisioned without scaling ranges so ingest stores them as-is.

---

## Frontend (`public/index.html`)

Single self-contained file. Key behaviours:

- **Map**: Leaflet + `leaflet.markercluster`. Markers are colour-coded by group (env=blue, Rotterdam=orange, Bordeaux=green, fuel=purple, phone=cyan). Clicking a marker shows last reading chips.
- **Table**: One row per device with Company, Location, chip-format readings, status badge (OK/ERR + HTTP code), and timestamp. Rows flash green on update.
- **Target selector**: "Current dashboard" (`SEND_TO_URL` env var default), "smartranger.com", or custom URL. URL is normalised (strips trailing `/api/ingest`, `/miketron-device` etc.) before being sent to the API as `?target=`.
- **Auto-send**: 15-second interval timer, toggled by the "Auto 15s" button.
- `DEVICE_META` in the HTML must stay in sync with device IDs and coordinates in `src/devices/`.
- `RENAME` map in the HTML provides short display labels for sensor names — update it when adding new sensor types.

---

## API (`api/simulate.ts`)

- Vercel serverless function, called by frontend via `GET /api/simulate?target=<value>`.
- `target` param resolves against the `TARGETS` map or is treated as a raw base URL.
- Fires all devices in parallel (`Promise.allSettled`) and returns `{ ok, target, sent, succeeded, timestamp, results[] }`.
- Each result includes `{ device, ok, status, readings[] }` — the readings array is consumed by the frontend for chip display and map popup updates.

---

## Environment

| Var | Where | Purpose |
|---|---|---|
| `SEND_TO_URL` | `.env` / Vercel env | Default ingest base URL (no `/api/ingest` suffix needed) |
| `PORT` | `.env` | Local dev port (default 3001) for standalone server |
| `CRON_SECRET` | Vercel env | Optional bearer token for cron trigger endpoint |

No `DATABASE_URL` — this repo must never access the dashboard database directly.

---

## Remote simulator boundary

- Keep this repo separate from `../remote_sensor_phone`.
- The only runtime connection to the dashboard is HTTP payload delivery to configured ingest endpoints.
- If new simulator devices or sensors are added here, provision the matching database rows deliberately in `../remote_sensor_phone`.
- Keep simulator `sensorLocalId` values, sensor names, and scaling ranges exactly aligned with the dashboard provisioning. Do not silently remap IDs in either repo.
- Do not add database access to this repo.
- Do not move production ingest logic from `../remote_sensor_phone` into this repo.
