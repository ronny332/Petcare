import { config } from './config.js';
import { FlapState } from './types/FlapState.js';
import { FlapStatusOnlineState } from './types/FlapDevice.js';
import { fhem as log } from './log.js';
import * as telnet from './telnet.js';

const isUpdateActive = (): boolean => config.fhem.updateEnabled;
const telnetOptions = telnet.createOptions(config.fhem.telnet);

const setOnlineStatus = async (online: FlapStatusOnlineState): Promise<void> => {
  if (isUpdateActive()) {
    return;
  }

  await telnet.open(telnetOptions);

  try {
    const res = await telnet.exec(`{ReadingsVal("${config.fhem.deviceOnlineStatus}","online","0")}`);

    if (res === null) {
      return;
    }

    const curStatus = res.trim() === '1';

    if (curStatus !== online) {
      log(`FHEM online status update ${online ? 'online' : 'offline'}`);

      await telnet.exec(`setreading ${config.fhem.deviceOnlineStatus} online ${online ? '1' : '0'}`);
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('FHEM online status update failed');
  }

  await telnet.end(false);
};

const setState = async (flap: FlapState): Promise<void> => {
  if (isUpdateActive()) {
    return;
  }

  await telnet.open(telnetOptions);

  try {
    const curFlap = await telnet.exec(`{Value("${config.fhem.deviceAlexa}")}`);

    if (curFlap === null) {
      return;
    }

    if (curFlap !== flap) {
      log(`FHEM state update ${flap}`);
      await telnet.exec(`set ${config.fhem.deviceAlexa} ${flap}`);
      await telnet.exec(`setreading ${config.fhem.deviceFhem} skipUpdate 1`);
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('FHEM state update failed');
  }

  await telnet.end(false);
};

export { setOnlineStatus, setState };
