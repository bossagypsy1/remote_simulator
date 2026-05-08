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

// Six devices clustered within ~5 km of each other (Wirral, UK)
export const devices: DeviceConfig[] = [
  { deviceId: 'env-001', baseLat: 53.3317, baseLon: -3.0592 },
  { deviceId: 'env-002', baseLat: 53.3340, baseLon: -3.0650 },
  { deviceId: 'env-003', baseLat: 53.3290, baseLon: -3.0530 },
  { deviceId: 'env-004', baseLat: 53.3360, baseLon: -3.0710 },
  { deviceId: 'env-005', baseLat: 53.3270, baseLon: -3.0480 },
  { deviceId: 'env-006', baseLat: 53.3380, baseLon: -3.0560 },
  {
    deviceId: 'rtm-001',
    baseLat: 51.9475,
    baseLon: 4.1521,
    company: 'MaasFab Rotterdam',
    label: 'Rotterdam Assembly Line North',
    sensors: [
      { sensorLocalId: 3, name: 'vibration', initial: 8.5, step: 1.2, min: 0, max: 50, decimals: 2 },
      { sensorLocalId: 4, name: 'motor_temperature', initial: 64, step: 1.5, min: 0, max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw', initial: 210, step: 12, min: 0, max: 500, decimals: 1 },
    ],
  },
  {
    deviceId: 'rtm-002',
    baseLat: 51.9468,
    baseLon: 4.1540,
    company: 'MaasFab Rotterdam',
    label: 'Rotterdam Paint Booth',
    sensors: [
      { sensorLocalId: 3, name: 'air_quality_voc', initial: 420, step: 60, min: 0, max: 2000, decimals: 0 },
      { sensorLocalId: 4, name: 'particulate_matter', initial: 55, step: 8, min: 0, max: 500, decimals: 1 },
      { sensorLocalId: 5, name: 'humidity', initial: 48, step: 2, min: 0, max: 100, decimals: 1 },
    ],
  },
  {
    deviceId: 'rtm-003',
    baseLat: 51.9484,
    baseLon: 4.1506,
    company: 'MaasFab Rotterdam',
    label: 'Rotterdam Compressor Room',
    sensors: [
      { sensorLocalId: 3, name: 'line_pressure', initial: 7.4, step: 0.4, min: 0, max: 16, decimals: 2 },
      { sensorLocalId: 4, name: 'noise_level', initial: 78, step: 3, min: 40, max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'temperature', initial: 24, step: 0.8, min: -20, max: 60, decimals: 1 },
    ],
  },
  {
    deviceId: 'bdx-001',
    baseLat: 44.8549,
    baseLon: -0.5567,
    company: 'Garonne Components',
    label: 'Bordeaux Process Hall',
    sensors: [
      { sensorLocalId: 3, name: 'temperature', initial: 21, step: 0.5, min: -20, max: 60, decimals: 1 },
      { sensorLocalId: 4, name: 'humidity', initial: 58, step: 2, min: 0, max: 100, decimals: 1 },
      { sensorLocalId: 5, name: 'co2_level', initial: 720, step: 80, min: 350, max: 5000, decimals: 0 },
    ],
  },
  {
    deviceId: 'bdx-002',
    baseLat: 44.8535,
    baseLon: -0.5583,
    company: 'Garonne Components',
    label: 'Bordeaux Packaging Line',
    sensors: [
      { sensorLocalId: 3, name: 'vibration', initial: 6.2, step: 0.9, min: 0, max: 50, decimals: 2 },
      { sensorLocalId: 4, name: 'noise_level', initial: 72, step: 2.5, min: 40, max: 120, decimals: 1 },
      { sensorLocalId: 5, name: 'power_draw', initial: 160, step: 10, min: 0, max: 500, decimals: 1 },
    ],
  },
  {
    deviceId: 'bdx-003',
    baseLat: 44.8562,
    baseLon: -0.5548,
    company: 'Garonne Components',
    label: 'Bordeaux Cold Store',
    sensors: [
      { sensorLocalId: 3, name: 'cold_room_temperature', initial: 4, step: 0.6, min: -30, max: 20, decimals: 1 },
      { sensorLocalId: 4, name: 'humidity', initial: 68, step: 2, min: 0, max: 100, decimals: 1 },
      { sensorLocalId: 5, name: 'coolant_temperature', initial: 8, step: 0.8, min: -10, max: 80, decimals: 1 },
    ],
  },
];

export function getDevice(deviceId: string): DeviceConfig | undefined {
  return devices.find((d) => d.deviceId === deviceId);
}
