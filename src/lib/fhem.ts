import { config } from './config.js';
import { FlapState } from './types/FlapState.js';
import { FlapStatusOnlineState } from './types/FlapDevice.js';
import { fhem as log } from './log.js';
import { Telnet } from 'telnet-client';

let connection: Telnet | null = null;

const connect = async (): Promise<boolean> => {
  try {
    if (!config.fhem.updateEnabled) {
      return false;
    }
    connection = new Telnet();

    await connection.connect(config.fhem);

    return true;
  } catch (ex: unknown) {
    log(ex);
    connection = null;

    return false;
  }
};

const end = async (): Promise<void> => {
  try {
    if (!connection) {
      return;
    }

    await connection.end();
  } catch (ex: unknown) {
    log(ex);
  }
  connection = null;
};

const setOnlineStatus = async (online: FlapStatusOnlineState): Promise<void> => {
  if (!await connect() || connection === null) {
    return;
  }

  try {
    const curStatus = (
      await connection.exec(`{ReadingsVal("${config.fhem.deviceOnlineStatus}","online","0")}`)
    ).trim() === '1';

    if (curStatus !== online) {
      log(`FHEM online status update ${online ? 'online' : 'offline'}`);

      await connection.exec(`setreading ${config.fhem.deviceOnlineStatus} online ${online ? '1' : '0'}`);
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('FHEM online status update failed');
  }

  await end();
};

const setState = async (flap: FlapState): Promise<void> => {
  if (!await connect() || connection === null) {
    return;
  }

  try {
    const curFlap = (
      await connection.exec(`{Value("${config.fhem.deviceAlexa}")}`)
    ).trim();

    if (curFlap !== flap) {
      log(`FHEM state update ${flap}`);
      await connection.exec(`set ${config.fhem.deviceAlexa} ${flap}`);
      await connection.exec(
        `setreading ${config.fhem.deviceFhem} skipUpdate 1`
      );
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('FHEM update failed');
  }

  await end();
};

export { setOnlineStatus, setState };
