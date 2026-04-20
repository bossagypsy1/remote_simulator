import { PhoneConfig } from '../devices/phone';

export interface SensorGroup {
  name: string;
  time: number;
  values: Record<string, number>;
}

export interface PhonePayload {
  messageId: number;
  sessionId: string;
  deviceId: string;
  payload: SensorGroup[];
}

interface PhoneState {
  lat: number;
  lon: number;
  speed: number;
  bearing: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  pressure: number;
  altitude: number;
  battery: number;
  batteryTemp: number;
}

const phoneStates = new Map<string, PhoneState>();

function getState(deviceId: string, baseLat: number, baseLon: number): PhoneState {
  if (!phoneStates.has(deviceId)) {
    phoneStates.set(deviceId, {
      lat: baseLat,
      lon: baseLon,
      speed: 1.0 + Math.random() * 2,
      bearing: Math.random() * 360,
      accelX: 0,
      accelY: 0,
      accelZ: 9.81,
      gyroX: 0,
      gyroY: 0,
      gyroZ: 0,
      pressure: 1013.25,
      altitude: 10,
      battery: 75 + Math.random() * 20,
      batteryTemp: 30 + Math.random() * 8,
    });
  }
  return phoneStates.get(deviceId)!;
}

function drift(current: number, maxStep: number, min: number, max: number): number {
  const next = current + (Math.random() * 2 - 1) * maxStep;
  return Math.min(max, Math.max(min, next));
}

function round(value: number, decimals: number): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

// UTC epoch nanoseconds — precision beyond ms is zeroed (JS limitation)
function nowNanos(): number {
  return Date.now() * 1_000_000;
}

export function generatePhonePayload(
  config: PhoneConfig,
  messageId: number,
  sessionId: string,
): PhonePayload {
  const state = getState(config.deviceId, config.baseLat, config.baseLon);

  // Phone drifts more than static env sensors — it is moving
  state.lat     = drift(state.lat, 0.0005, config.baseLat - 0.01, config.baseLat + 0.01);
  state.lon     = drift(state.lon, 0.0005, config.baseLon - 0.01, config.baseLon + 0.01);
  state.speed   = drift(state.speed, 0.3, 0, 15);
  state.bearing = (state.bearing + (Math.random() * 20 - 10) + 360) % 360;
  state.accelX     = drift(state.accelX,     0.05, -2, 2);
  state.accelY     = drift(state.accelY,     0.05, -2, 2);
  state.accelZ     = drift(state.accelZ,     0.02, 9.0, 10.0);
  state.gyroX      = drift(state.gyroX,      0.002, -0.1, 0.1);
  state.gyroY      = drift(state.gyroY,      0.002, -0.1, 0.1);
  state.gyroZ      = drift(state.gyroZ,      0.001, -0.05, 0.05);
  state.pressure   = drift(state.pressure,   0.5, 980, 1040);
  state.altitude   = drift(state.altitude,   0.2, 0, 100);
  state.battery    = drift(state.battery,    0.05, 0, 100);
  state.batteryTemp = drift(state.batteryTemp, 0.1, 25, 45);

  const t = nowNanos();

  return {
    messageId,
    sessionId,
    deviceId: config.deviceId,
    payload: [
      {
        name: 'location',
        time: t,
        values: {
          latitude:  round(state.lat, 6),
          longitude: round(state.lon, 6),
          speed:     round(state.speed, 2),
          bearing:   round(state.bearing, 1),
        },
      },
      {
        name: 'accelerometer',
        time: t,
        values: {
          x: round(state.accelX, 4),
          y: round(state.accelY, 4),
          z: round(state.accelZ, 4),
        },
      },
      {
        name: 'gyroscope',
        time: t,
        values: {
          x: round(state.gyroX, 6),
          y: round(state.gyroY, 6),
          z: round(state.gyroZ, 6),
        },
      },
      {
        name: 'barometer',
        time: t,
        values: {
          pressure:         round(state.pressure, 2),
          relativeAltitude: round(state.altitude, 2),
        },
      },
      {
        name: 'compass',
        time: t,
        values: {
          magneticBearing: round(state.bearing, 1),
        },
      },
      {
        name: 'battery',
        time: t,
        values: {
          batteryLevel: round(state.battery / 100, 4),
        },
      },
      {
        name: 'battery temp',
        time: t,
        values: {
          temperature: round(state.batteryTemp, 1),
        },
      },
    ],
  };
}
