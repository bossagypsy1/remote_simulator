import { FuelDeviceConfig } from '../devices/fuel_registry';
import { DevicePayload } from './environmental';
import { toRaw, FUEL_SCALING } from '../utils/scaling';

// Per-device state: drift in engineering units, then convert to raw mA before sending
interface FuelState {
  level:       number;  // %
  temperature: number;  // °C
  pressure:    number;  // bar
}

const fuelStates = new Map<string, FuelState>();

function getState(deviceId: string): FuelState {
  if (!fuelStates.has(deviceId)) {
    fuelStates.set(deviceId, {
      level:       60  + (Math.random() * 30  - 15),
      temperature: 18  + (Math.random() * 6   - 3),
      pressure:    2.5 + (Math.random() * 0.6 - 0.3),
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

  // Drift engineering values
  state.level       = drift(state.level,       0.5,  10,  98);
  state.temperature = drift(state.temperature, 0.2,  5,   35);
  state.pressure    = drift(state.pressure,    0.05, 0.5, 5.0);

  // Convert engineering values → raw 4-20 mA signals
  const rawLevel       = round(toRaw(state.level,       FUEL_SCALING.tank_level),       4);
  const rawTemperature = round(toRaw(state.temperature, FUEL_SCALING.tank_temperature), 4);
  const rawPressure    = round(toRaw(state.pressure,    FUEL_SCALING.tank_pressure),    4);

  return {
    deviceId:  device.deviceId,
    messageId,
    timestamp: new Date().toISOString(),
    payload: [
      { sensorLocalId: 1, name: 'tank_level',       value: rawLevel },        // mA
      { sensorLocalId: 2, name: 'tank_temperature', value: rawTemperature },  // mA
      { sensorLocalId: 3, name: 'tank_pressure',    value: rawPressure },     // mA
    ],
  };
}
