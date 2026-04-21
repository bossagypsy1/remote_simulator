import { DeviceConfig } from '../devices/registry';
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

// Per-device state: drift in engineering units, then convert to raw mA before sending
interface DeviceState {
  temperature: number;  // °C
  pressure:    number;  // hPa
  humidity:    number;  // %
  acidity:     number;  // pH
}

const deviceStates = new Map<string, DeviceState>();

function getState(deviceId: string): DeviceState {
  if (!deviceStates.has(deviceId)) {
    deviceStates.set(deviceId, {
      temperature: 16 + (Math.random() * 4  - 2),
      pressure:    1013 + (Math.random() * 6 - 3),
      humidity:    70  + (Math.random() * 10 - 5),
      acidity:     7.5 + (Math.random() * 0.4 - 0.2),
    });
  }
  return deviceStates.get(deviceId)!;
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
  const state = getState(device.deviceId);

  // Drift engineering values
  state.temperature = drift(state.temperature, 0.3, 10,  22);
  state.pressure    = drift(state.pressure,    0.5, 1000, 1025);
  state.humidity    = drift(state.humidity,    1.0, 50,  90);
  state.acidity     = drift(state.acidity,     0.05, 6.5, 8.5);

  // GPS stays as already-scaled values (no conversion)
  const lat = round(jitter(device.baseLat, 0.001), 6);
  const lon = round(jitter(device.baseLon, 0.001), 6);

  // Convert engineering values → raw 4-20 mA signals
  const rawTemp     = round(toRaw(state.temperature, ENV_SCALING.temperature), 4);
  const rawPressure = round(toRaw(state.pressure,    ENV_SCALING.pressure),    4);
  const rawHumidity = round(toRaw(state.humidity,    ENV_SCALING.humidity),    4);
  const rawAcidity  = round(toRaw(state.acidity,     ENV_SCALING.acidity),     4);

  return {
    deviceId:  device.deviceId,
    messageId,
    timestamp: new Date().toISOString(),
    payload: [
      { sensorLocalId: 1, name: 'latitude',    value: lat },           // already scaled — GPS
      { sensorLocalId: 2, name: 'longitude',   value: lon },           // already scaled — GPS
      { sensorLocalId: 3, name: 'temperature', value: rawTemp },       // mA
      { sensorLocalId: 4, name: 'pressure',    value: rawPressure },   // mA
      { sensorLocalId: 5, name: 'humidity',    value: rawHumidity },   // mA
      { sensorLocalId: 6, name: 'acidity',     value: rawAcidity },    // mA
    ],
  };
}
