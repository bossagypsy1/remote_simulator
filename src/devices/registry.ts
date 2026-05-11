export interface DeviceConfig {
  deviceId: string;
  baseLat: number;
  baseLon: number;
  company?: string;
  label?: string;
  sensors?: DeviceSensorConfig[];
}

export interface DeviceSensorConfig {
  sensorLocalId: number;
  name: string;
  initial: number;
  step: number;
  min: number;
  max: number;
  decimals: number;
}

// ── Wirral Environmental (env-001…env-006) ───────────────────────────────────
// Default ENV sensors (temperature, pressure, humidity, acidity via 4-20 mA)
export const devices: DeviceConfig[] = [
  { deviceId: 'env-001', baseLat: 53.3317, baseLon: -3.0592 },
  { deviceId: 'env-002', baseLat: 53.3340, baseLon: -3.0650 },
  { deviceId: 'env-003', baseLat: 53.3290, baseLon: -3.0530 },
  { deviceId: 'env-004', baseLat: 53.3360, baseLon: -3.0710 },
  { deviceId: 'env-005', baseLat: 53.3270, baseLon: -3.0480 },
  { deviceId: 'env-006', baseLat: 53.3380, baseLon: -3.0560 },

  // ── MaasFab Rotterdam (heavy manufacturing) ────────────────────────────────
  {
    deviceId: 'rtm-001', baseLat: 51.9475, baseLon: 4.1521,
    company: 'MaasFab Rotterdam', label: 'Assembly Line North',
    sensors: [
      { sensorLocalId: 3, name: 'vibration',         initial: 8.5,  step: 1.2,  min: 0,  max: 50,  decimals: 2 },
      { sensorLocalId: 4, name: 'motor_temperature',  initial: 64,   step: 1.5,  min: 0,  max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw',         initial: 210,  step: 12,   min: 0,  max: 500, decimals: 1 },
    ],
  },
  {
    deviceId: 'rtm-002', baseLat: 51.9468, baseLon: 4.1540,
    company: 'MaasFab Rotterdam', label: 'Paint Booth',
    sensors: [
      { sensorLocalId: 3, name: 'air_quality_voc',   initial: 420,  step: 60,   min: 0,  max: 2000, decimals: 0 },
      { sensorLocalId: 4, name: 'particulate_matter', initial: 55,   step: 8,    min: 0,  max: 500,  decimals: 1 },
      { sensorLocalId: 5, name: 'humidity',           initial: 48,   step: 2,    min: 0,  max: 100,  decimals: 1 },
    ],
  },
  {
    deviceId: 'rtm-003', baseLat: 51.9484, baseLon: 4.1506,
    company: 'MaasFab Rotterdam', label: 'Compressor Room',
    sensors: [
      { sensorLocalId: 3, name: 'line_pressure',      initial: 7.4,  step: 0.4,  min: 0,  max: 16,  decimals: 2 },
      { sensorLocalId: 4, name: 'noise_level',         initial: 78,   step: 3,    min: 40, max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'temperature',         initial: 24,   step: 0.8,  min: -20, max: 60, decimals: 1 },
    ],
  },

  // ── Garonne Components Bordeaux (precision parts) ─────────────────────────
  {
    deviceId: 'bdx-001', baseLat: 44.8549, baseLon: -0.5567,
    company: 'Garonne Components', label: 'Process Hall',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',        initial: 21,   step: 0.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',            initial: 58,   step: 2,    min: 0,   max: 100, decimals: 1 },
      { sensorLocalId: 5, name: 'co2_level',           initial: 720,  step: 80,   min: 350, max: 5000, decimals: 0 },
    ],
  },
  {
    deviceId: 'bdx-002', baseLat: 44.8535, baseLon: -0.5583,
    company: 'Garonne Components', label: 'Packaging Line',
    sensors: [
      { sensorLocalId: 3, name: 'vibration',           initial: 6.2,  step: 0.9,  min: 0,   max: 50,  decimals: 2 },
      { sensorLocalId: 4, name: 'noise_level',          initial: 72,   step: 2.5,  min: 40,  max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw',           initial: 160,  step: 10,   min: 0,   max: 500, decimals: 1 },
    ],
  },
  {
    deviceId: 'bdx-003', baseLat: 44.8562, baseLon: -0.5548,
    company: 'Garonne Components', label: 'Cold Store',
    sensors: [
      { sensorLocalId: 3, name: 'cold_room_temperature', initial: 4,   step: 0.6,  min: -30, max: 20, decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',               initial: 68,  step: 2,    min: 0,   max: 100, decimals: 1 },
      { sensorLocalId: 5, name: 'coolant_temperature',    initial: 8,   step: 0.8,  min: -10, max: 80, decimals: 1 },
    ],
  },

  // ── RheinChem Hamburg (chemical / process plant) ──────────────────────────
  {
    deviceId: 'ham-001', baseLat: 53.5336, baseLon: 9.9936,
    company: 'RheinChem Hamburg', label: 'Reactor Bay A',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',        initial: 85,   step: 2,    min: 20,  max: 200, decimals: 1 },
      { sensorLocalId: 4, name: 'pressure',           initial: 1020, step: 1.5,  min: 950, max: 1060, decimals: 1 },
      { sensorLocalId: 5, name: 'co2_level',          initial: 1200, step: 150,  min: 350, max: 5000, decimals: 0 },
    ],
  },
  {
    deviceId: 'ham-002', baseLat: 53.5328, baseLon: 9.9958,
    company: 'RheinChem Hamburg', label: 'Storage Tank Farm',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',        initial: 18,   step: 0.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'pressure',           initial: 1012, step: 1,    min: 950, max: 1060, decimals: 1 },
      { sensorLocalId: 5, name: 'humidity',           initial: 62,   step: 2,    min: 0,   max: 100,  decimals: 1 },
    ],
  },
  {
    deviceId: 'ham-003', baseLat: 53.5350, baseLon: 9.9912,
    company: 'RheinChem Hamburg', label: 'Cooling Tower',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',        initial: 32,   step: 1.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',           initial: 88,   step: 2,    min: 0,   max: 100,  decimals: 1 },
      { sensorLocalId: 5, name: 'noise_level',        initial: 68,   step: 3,    min: 40,  max: 120,  decimals: 1 },
    ],
  },

  // ── AlpineForge Munich (automotive precision manufacturing) ───────────────
  {
    deviceId: 'mun-001', baseLat: 48.1762, baseLon: 11.5562,
    company: 'AlpineForge Munich', label: 'Press Shop',
    sensors: [
      { sensorLocalId: 3, name: 'vibration',          initial: 18,   step: 2.5,  min: 0,   max: 50,  decimals: 2 },
      { sensorLocalId: 4, name: 'noise_level',         initial: 92,   step: 4,    min: 40,  max: 120,  decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw',          initial: 340,  step: 20,   min: 0,   max: 500,  decimals: 1 },
    ],
  },
  {
    deviceId: 'mun-002', baseLat: 48.1748, baseLon: 11.5580,
    company: 'AlpineForge Munich', label: 'Paint Shop',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',         initial: 22,   step: 0.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',             initial: 55,   step: 2,    min: 0,   max: 100,  decimals: 1 },
      { sensorLocalId: 5, name: 'air_quality_voc',      initial: 380,  step: 50,   min: 0,   max: 2000, decimals: 0 },
    ],
  },
  {
    deviceId: 'mun-003', baseLat: 48.1775, baseLon: 11.5545,
    company: 'AlpineForge Munich', label: 'Test Hall',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',         initial: 19,   step: 0.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'vibration',           initial: 12,   step: 1.8,  min: 0,   max: 50,  decimals: 2 },
      { sensorLocalId: 5, name: 'motor_temperature',   initial: 72,   step: 2,    min: 0,   max: 120,  decimals: 1 },
    ],
  },

  // ── AdriaTex Milan (textile & light manufacturing) ────────────────────────
  {
    deviceId: 'mil-001', baseLat: 45.5300, baseLon: 9.2300,
    company: 'AdriaTex Milan', label: 'Weaving Floor',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',         initial: 23,   step: 0.5,  min: -20, max: 60,  decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',             initial: 65,   step: 2,    min: 0,   max: 100,  decimals: 1 },
      { sensorLocalId: 5, name: 'noise_level',          initial: 82,   step: 3,    min: 40,  max: 120,  decimals: 1 },
    ],
  },
  {
    deviceId: 'mil-002', baseLat: 45.5288, baseLon: 9.2318,
    company: 'AdriaTex Milan', label: 'Dye House',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',         initial: 68,   step: 2,    min: -20, max: 200, decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',             initial: 80,   step: 2,    min: 0,   max: 100,  decimals: 1 },
      { sensorLocalId: 5, name: 'acidity',              initial: 5.8,  step: 0.1,  min: 0,   max: 14,   decimals: 2 },
    ],
  },
  {
    deviceId: 'mil-003', baseLat: 45.5315, baseLon: 9.2285,
    company: 'AdriaTex Milan', label: 'Cold Store',
    sensors: [
      { sensorLocalId: 3, name: 'cold_room_temperature', initial: 2,  step: 0.6,  min: -30, max: 20,  decimals: 1 },
      { sensorLocalId: 4, name: 'humidity',               initial: 72, step: 2,    min: 0,   max: 100,  decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw',             initial: 95, step: 8,    min: 0,   max: 500,  decimals: 1 },
    ],
  },

  // ── VistulaChem Warsaw (heavy chemical & steel) ───────────────────────────
  {
    deviceId: 'waw-001', baseLat: 52.2297, baseLon: 21.0680,
    company: 'VistulaChem Warsaw', label: 'Furnace A',
    sensors: [
      { sensorLocalId: 3, name: 'temperature',         initial: 1180, step: 15,   min: 20,  max: 1400, decimals: 0 },
      { sensorLocalId: 4, name: 'pressure',            initial: 1008, step: 2,    min: 950, max: 1060,  decimals: 1 },
      { sensorLocalId: 5, name: 'co2_level',           initial: 3800, step: 200,  min: 350, max: 5000,  decimals: 0 },
    ],
  },
  {
    deviceId: 'waw-002', baseLat: 52.2285, baseLon: 21.0698,
    company: 'VistulaChem Warsaw', label: 'Rolling Mill',
    sensors: [
      { sensorLocalId: 3, name: 'vibration',           initial: 28,   step: 4,    min: 0,   max: 50,   decimals: 2 },
      { sensorLocalId: 4, name: 'motor_temperature',   initial: 88,   step: 3,    min: 0,   max: 120,  decimals: 1 },
      { sensorLocalId: 5, name: 'noise_level',          initial: 96,   step: 4,    min: 40,  max: 120,  decimals: 1 },
    ],
  },
  {
    deviceId: 'waw-003', baseLat: 52.2310, baseLon: 21.0665,
    company: 'VistulaChem Warsaw', label: 'Compressor Station',
    sensors: [
      { sensorLocalId: 3, name: 'line_pressure',       initial: 11.2, step: 0.6,  min: 0,   max: 16,   decimals: 2 },
      { sensorLocalId: 4, name: 'temperature',         initial: 38,   step: 1,    min: -20, max: 60,   decimals: 1 },
      { sensorLocalId: 5, name: 'motor_temperature',   initial: 56,   step: 2,    min: 0,   max: 120,  decimals: 1 },
    ],
  },
];

export function getDevice(deviceId: string): DeviceConfig | undefined {
  return devices.find((d) => d.deviceId === deviceId);
}
