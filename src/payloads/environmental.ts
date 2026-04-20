import { DeviceConfig } from '../devices/registry';

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

// Per-device state so values drift gradually over time rather than jumping randomly
interface DeviceState {
  temperature: number;
  pressure: number;
  humidity: number;
  acidity: number;
}

const deviceStates = new Map<string, DeviceState>();

function getState(deviceId: string): DeviceState {
  if (!deviceStates.has(deviceId)) {
    deviceStates.set(deviceId, {
      temperature: 16 + (Math.random() * 4 - 2),
      pressure: 1013 + (Math.random() * 6 - 3),
      humidity: 70 + (Math.random() * 10 - 5),
      acidity: 7.5 + (Math.random() * 0.4 - 0.2),
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

  // Drift sensor values gradually
  state.temperature = drift(state.temperature, 0.3, 10, 22);
  state.pressure = drift(state.pressure, 0.5, 1000, 1025);
  state.humidity = drift(state.humidity, 1.0, 50, 90);
  state.acidity = drift(state.acidity, 0.05, 6.5, 8.5);

  // Small GPS jitter (~±111 m at these latitudes for 0.001 deg)
  const lat = round(jitter(device.baseLat, 0.001), 6);
  const lon = round(jitter(device.baseLon, 0.001), 6);

  return {
    deviceId: device.deviceId,
    messageId,
    timestamp: new Date().toISOString(),
    payload: [
      { sensorLocalId: 1, name: 'latitude', value: lat },
      { sensorLocalId: 2, name: 'longitude', value: lon },
      { sensorLocalId: 3, name: 'temperature', value: round(state.temperature, 1) },
      { sensorLocalId: 4, name: 'pressure', value: round(state.pressure, 1) },
      { sensorLocalId: 5, name: 'humidity', value: round(state.humidity, 1) },
      { sensorLocalId: 6, name: 'acidity', value: round(state.acidity, 2) },
    ],
  };
}
