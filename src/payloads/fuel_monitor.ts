import { FuelDeviceConfig } from '../devices/fuel_registry';
import { DevicePayload } from './environmental';

interface FuelState {
  level:       number;  // %
  temperature: number;  // °C
  pressure:    number;  // bar
}

const fuelStates = new Map<string, FuelState>();

function getState(deviceId: string): FuelState {
  if (!fuelStates.has(deviceId)) {
    fuelStates.set(deviceId, {
      level:       60 + (Math.random() * 30 - 15),   // 45–75 %
      temperature: 18 + (Math.random() * 6  - 3),    // 15–21 °C
      pressure:    2.5 + (Math.random() * 0.6 - 0.3), // 2.2–2.8 bar
    });
  }
  return fuelStates.get(deviceId)!;
}

function drift(current: number, step: number, min: number, max: number): number {
  const next = current + (Math.random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, next));
}

function round(value: number, decimals: number): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function generateFuelPayload(
  device: FuelDeviceConfig,
  messageId: number,
): DevicePayload {
  const state = getState(device.deviceId);

  // Gradual drift — level slowly depletes (or refills), temp and pressure float
  state.level       = drift(state.level,       0.5,  10,  98);
  state.temperature = drift(state.temperature, 0.2,  5,   35);
  state.pressure    = drift(state.pressure,    0.05, 0.5, 5.0);

  return {
    deviceId:  device.deviceId,
    messageId,
    timestamp: new Date().toISOString(),
    payload: [
      { sensorLocalId: 1, name: 'tank_level',       value: round(state.level,       1) },
      { sensorLocalId: 2, name: 'tank_temperature', value: round(state.temperature, 2) },
      { sensorLocalId: 3, name: 'tank_pressure',    value: round(state.pressure,    3) },
    ],
  };
}
