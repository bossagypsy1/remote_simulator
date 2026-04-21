export interface FuelDeviceConfig {
  deviceId: string;
  label: string;
  staticLat: number;
  staticLon: number;
}

export const fuelDevices: FuelDeviceConfig[] = [
  { deviceId: 'fuel-001', label: 'Sheffield Depot', staticLat: 53.3811, staticLon: -1.4701 },
  { deviceId: 'fuel-002', label: 'Bristol Storage',  staticLat: 51.4545, staticLon: -2.5879 },
  { deviceId: 'fuel-003', label: 'Norwich Site',     staticLat: 52.6309, staticLon:  1.2974 },
];
