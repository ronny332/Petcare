import { Config } from './types/Config.js';
import { ConfigJson } from './types/ConfigJson.js';
import debug from 'debug';
import { fileURLToPath } from 'node:url';
import lodash from 'lodash';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const config: Config = {
  fhem: {
    deviceAlexa: '',
    deviceFhem: '',
    deviceOnlineStatus: '',
    updateEnabled: true,
    telnet: {
      host: '',
      port: 0,
      shellPrompt: 'fhem> ',
    }
  },
  flap: {
    // Random string
    deviceId: '',
    delays: {
      state: {
        interval: 30_000,
        retry: 30_000,
      },
      status: {
        cache: 90_000,
        interval: 60_000,
        retry: 60_000,
      }
    },
    emailAddress: '',
    householdId: 0,
    password: '',
    petId: 0,
    sleep: 30,
    urls: {
      device: 'https://app.api.surehub.io/api/device?with[]=status',
      login: 'https://app.api.surehub.io/api/auth/login',
      position: 'https://app.api.surehub.io/api/pet/',
      state: 'https://app.api.surehub.io/api/report/household/',
    },
  },
  name: 'petcare',
  server: {
    port: 6_924,
    updateFhem: true,
  },
};

const log = debug(`${config.name}:config`);

const custom = (): void => {
  try {
    const baseDirectory = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../'
    );
    const userConfig = JSON.parse(
      readFileSync(`${baseDirectory}/config.user.json`, 'utf8')
    ) as ConfigJson;

    lodash.merge(config.fhem, userConfig.fhem);
    lodash.merge(config.flap, userConfig.flap);

    log('read user configuration');
  } catch (ex: unknown) {
    log(ex);
  }
};

const init = (): void => {
  config.flap.urls.position += `${config.flap.petId}/position`;
  config.flap.urls.state += `${config.flap.householdId}/pet/${config.flap.petId}/aggregate`;
};

custom();
init();

export { config };
