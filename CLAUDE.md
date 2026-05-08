

# CLAUDE.md

## Repo purpose

Remote Simulator is a testing tool for generating fake sensor payloads and sending them to a Remote Sensor Dashboard ingest endpoint. It exists to exercise the ingest API and dashboard behavior without being part of the production dashboard app.

## Boundary with `../remote_sensor_phone`

- Keep this repo separate from `../remote_sensor_phone`.
- This repo must not import dashboard database code or mutate the dashboard database directly.
- The simulator should only communicate with the dashboard over HTTP ingest endpoints.
- The simulator can be pointed at local, Vercel, or another target using configured send URLs.
- Simulator traffic should stay clearly identifiable as test traffic, for example via `X-Simulator-Source`.

## Allowed simulator responsibilities

- Define fake/test device IDs.
- Define test payload shapes.
- Define test sensor channels.
- Define simulator-side scaling constants and generated values.
- Send test payloads to configured ingest endpoints.

## Dashboard provisioning dependency

When new simulator devices or sensors are added here, the dashboard repo may need a separate provisioning change in `../remote_sensor_phone`.

That dashboard change may include:

- `sensor_types`
- `units`
- `sensors`
- `sensor_local_id` mappings
- 4-20 mA or other scaling ranges

Keep simulator `sensorLocalId` values, sensor names, and scaling ranges exactly aligned with the dashboard provisioning. Do not silently remap IDs in either repo.

## Safety rules

- Do not add database access to this repo.
- Do not treat simulator devices as production devices.
- Do not move production ingest logic from `../remote_sensor_phone` into this repo.
- Do not remove or rename payload fields without checking the dashboard ingest parser.
