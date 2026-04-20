export interface DeviceConfig {
  deviceId: string;
  baseLat: number;
  baseLon: number;
}

// Six devices clustered within ~5 km of each other (Wirral, UK)
export const devices: DeviceConfig[] = [
  { deviceId: 'env-001', baseLat: 53.3317, baseLon: -3.0592 },
  { deviceId: 'env-002', baseLat: 53.3340, baseLon: -3.0650 },
  { deviceId: 'env-003', baseLat: 53.3290, baseLon: -3.0530 },
  { deviceId: 'env-004', baseLat: 53.3360, baseLon: -3.0710 },
  { deviceId: 'env-005', baseLat: 53.3270, baseLon: -3.0480 },
  { deviceId: 'env-006', baseLat: 53.3380, baseLon: -3.0560 },
];

export function getDevice(deviceId: string): DeviceConfig | undefined {
  return devices.find((d) => d.deviceId === deviceId);
}
