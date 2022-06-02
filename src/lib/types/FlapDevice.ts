/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/naming-convention */

interface FlapStatusData {
  data: FlapStatus[];
}

interface FlapStatus {
  id: number;
  parent_device_id: number;
  product_id: number;
  household_id: number;
  name: string;
  serial_number: string;
  mac_address: string;
  index: number;
  version: string;
  created_at: string;
  updated_at: string;
  pairing_at: string;
  parent: FlapStatusParent;
  status: FlapStatusStatusDetails;
}

interface FlapStatusParent {
  id: number;
  product_id: number;
  household_id: number;
  name: string;
  serial_number: string;
  mac_address: string;
  version: string;
  created_at: string;
  updated_at: string;
}

interface FlapStatusStatusDetails {
  locking: FlapStatusLocking;
  version: FlapStatusVersion;
  battery: number;
  learn_mode: null;
  online: boolean;
  signal: FlapStatusSignal;
}

interface FlapStatusLocking {
  mode: number;
}

interface FlapStatusSignal {
  device_rssi: number;
  hub_rssi: number;
}

interface FlapStatusVersion {
  device: FlapStatusDevice;
}

interface FlapStatusDevice {
  hardware: number;
  firmware: number;
}

interface FlapStatusCache {
  current: FlapStatus | null;
  date: Date | null;
}

type FlapStatusOnlineState = boolean | null;

export { FlapStatusData, FlapStatus, FlapStatusCache, FlapStatusOnlineState };
