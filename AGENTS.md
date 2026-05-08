# AGENTS.md

<-- Added by write-agents-md-all.bat -->

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

## Remote simulator boundary

- Keep this repo separate from `../remote_sensor_phone`.
- This repo is a test sender only. It should not access the production dashboard database directly.
- The simulator may define fake/test device IDs, payload shapes, sensor channels, and scaling values.
- The only runtime connection to the dashboard should be HTTP payload delivery to configured ingest endpoints.
- If new simulator devices or sensors are added here, provision the matching database rows deliberately in `../remote_sensor_phone`.
- Matching dashboard provisioning may include `sensor_types`, `units`, `sensors`, and scaling ranges.
- Keep simulator `sensorLocalId` / sensor names exactly aligned with the dashboard provisioning.

