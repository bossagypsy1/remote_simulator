import { DeviceConfig, DeviceSensorConfig } from '../devices/registry';
import { toRaw, ENV_SCALING } from '../utils/scaling';

export interface SensorReading {
  sensorLocalId: number;
  name: string;
  value: number;
}

export interface DevicePayload {
  deviceId: string;
  messageId: number;
  timestamp: string;
  payload: SensorReading[];
}

interface DeviceState {
  values: Record<string, number>;
}

const DEFAULT_ENV_SENSORS: DeviceSensorConfig[] = [
  { sensorLocalId: 3, name: 'temperature', initial: 16, step: 0.3, min: 10, max: 22, decimals: 2 },
  { sensorLocalId: 4, name: 'pressure', initial: 1013, step: 0.5, min: 1000, max: 1025, decimals: 2 },
  { sensorLocalId: 5, name: 'humidity', initial: 70, step: 1, min: 50, max: 90, decimals: 2 },
  { sensorLocalId: 6, name: 'acidity', initial: 7.5, step: 0.05, min: 6.5, max: 8.5, decimals: 3 },
];

const deviceStates = new Map<string, DeviceState>();

function getSensorConfig(device: DeviceConfig): DeviceSensorConfig[] {
  return device.sensors ?? DEFAULT_ENV_SENSORS;
}

function getState(device: DeviceConfig): DeviceState {
  if (!deviceStates.has(device.deviceId)) {
    const values: Record<string, number> = {};
    for (const sensor of getSensorConfig(device)) {
      values[sensor.name] = sensor.initial + (Math.random() * 2 - 1) * sensor.step;
    }
    deviceStates.set(device.deviceId, { values });
  }
  return deviceStates.get(device.deviceId)!;
}

function drift(current: number, maxStep: number, min: number, max: number): number {
  const next = current + (Math.random() * 2 - 1) * maxStep;
  return Math.min(max, Math.max(min, next));
}

function jitter(base: number, maxDelta: number): number {
  return base + (Math.random() * 2 - 1) * maxDelta;
}

function round(value: number, decimals: number): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function generateEnvironmentalPayload(
  device: DeviceConfig,
  messageId: number,
): DevicePayload {
  const state = getState(device);
  const sensors = getSensorConfig(device);

  const lat = round(jitter(device.baseLat, 0.001), 6);
  const lon = round(jitter(device.baseLon, 0.001), 6);

  const sensorReadings = sensors.map((sensor) => {
    state.values[sensor.name] = drift(
      state.values[sensor.name] ?? sensor.initial,
      sensor.step,
      sensor.min,
      sensor.max,
    );
    const scaling = ENV_SCALING[sensor.name as keyof typeof ENV_SCALING];
    return {
      sensorLocalId: sensor.sensorLocalId,
      name: sensor.name,
      value: round(toRaw(state.values[sensor.name], scaling), 4),
    };
  });

  return {
    deviceId: device.deviceId,
    messageId,
    timestamp: new Date().toISOString(),
    payload: [
      { sensorLocalId: 1, name: 'latitude', value: lat },
      { sensorLocalId: 2, name: 'longitude', value: lon },
      ...sensorReadings,
    ],
  };
}
