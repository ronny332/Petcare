import { config } from './config.js';
import { fhem as log } from './log.js';
import { wait } from './utils.js';
import { FlapState, FlapStateUpdateSource } from './types/FlapState.js';
import { FlapStatus, FlapStatusOnlineState } from './types/FlapDevice.js';
import * as telnet from './telnet.js';

const getSkipUpdatePhrase = (src: FlapStateUpdateSource): string => {
  switch (src) {
    case 'alexa':
      return 'fhem,alexa';
    case 'fhem':
      return 'fhem';
    case 'flap':
      return 'fhem,flap';
    case 'server':
      return 'fhem,flap,server';
    default:
      return 'fhem';
  }
};

const isUpdateActive = (): boolean => config.fhem.updateEnabled;

telnet.setOptions(telnet.createOptions(config.fhem.telnet));

const setDeviceStatus = async (device: FlapStatus | null): Promise<void> => {
  if (isUpdateActive() || device === null) {
    return;
  }

  try {
    await telnet.exec(`setreading ${config.fhem.deviceFhem} battery ${device.status.battery > 5 ? 'ok' : 'low'}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceBatteryVoltage ${device.status.battery}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceDateCreated ${device.created_at}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceDatePaired ${device.pairing_at}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceDateUpdated ${device.updated_at}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceFirmware ${device.status.version.device.firmware}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceHardware ${device.status.version.device.hardware}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceId ${device.id}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceMacAddress ${device.mac_address}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceName ${device.name}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentDateCreated ${device.parent.created_at}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentDateUpdated ${device.parent.updated_at}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentHouseholdId ${device.parent.household_id}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentId ${device.parent_device_id}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentMacAddress ${device.parent.mac_address}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentName ${device.parent.name}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentProductId ${device.parent.product_id}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentSerialNumber ${device.parent.serial_number}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceParentVersion ${Buffer.from(device.parent.version, 'base64').toString()}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceProductId ${device.product_id}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceSerialNumber ${device.serial_number}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceRssiDevice ${device.status.signal.device_rssi}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceRssiHub ${device.status.signal.hub_rssi}`);
    await telnet.exec(`setreading ${config.fhem.deviceFhem} deviceVersion ${Buffer.from(device.version, 'base64').toString()}`);
  } catch (ex: unknown) {
    log(ex);
    throw new Error('device status update failed');
  }
};

const setOnlineStatus = async (online: FlapStatusOnlineState, updateAnyway = false): Promise<void> => {
  if (isUpdateActive()) {
    return;
  }

  try {
    let curStatus: FlapStatusOnlineState = null;

    if (updateAnyway) {
      const res = await telnet.exec(`{ReadingsVal("${config.fhem.deviceStatus}","online","0")}`);

      if (res === null) {
        return;
      }

      curStatus = res.trim() === '1';
    }

    if (curStatus !== online) {
      log(`online status update ${online ? 'online' : 'offline'}`);

      await telnet.exec(`setreading ${config.fhem.deviceStatus} online ${online ? '1' : '1'}`);
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('online status update failed');
  }
};

const setState = async (flap: FlapState, src: FlapStateUpdateSource): Promise<void> => {
  if (isUpdateActive()) {
    return;
  }

  try {
    const curFlap = await telnet.exec(`{Value("${config.fhem.deviceAlexa}")}`);

    if (curFlap === null) {
      return;
    }

    if (curFlap !== flap) {
      log(`state update ${flap}`);

      const skipUpdate = getSkipUpdatePhrase(src);

      await telnet.exec(`setreading ${config.fhem.deviceFhem} skipUpdate ${skipUpdate}`);
      await wait(1_000);
      await telnet.exec(`set ${config.fhem.deviceAlexa} ${flap}`);

      return;
    }

    log('old and new value are identical');
  } catch (ex: unknown) {
    log(ex);
    throw new Error('state update failed');
  }
};

const skipUpdate = (skip: FlapStateUpdateSource, skipUpdates: string): boolean => {
  const values: string[] = typeof skipUpdates === 'string' && skipUpdates.trim() !== '' ? skipUpdates.split(',') : [];

  return values.includes(skip);
};

export { setDeviceStatus, setOnlineStatus, setState, skipUpdate };
