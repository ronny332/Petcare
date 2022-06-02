import { config } from './config.js';
import fetch from 'node-fetch';
import { FlapState } from './types/FlapState.js';
import { flapPosition as log } from './log.js';
import { RequestPosition } from './types/RequestPosition.js';
import * as login from './flapLogin.js';

const getDateString = (): string => {
  const now = new Date();

  return (
    `${now.getUTCFullYear()}-` +
    `${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-` +
    `${now.getUTCDate().toString().padStart(2, '0')} ` +
    `${now.getUTCHours().toString().padStart(2, '0')}:` +
    `${now.getUTCMinutes().toString().padStart(2, '0')}:` +
    `${now.getUTCSeconds().toString().padStart(2, '0')}`
  );
};

const flapStateToApi = {
  closed: 1,
  open: 2,
};

const setPosition = async (flap: FlapState): Promise<boolean> => {
  try {
    const token = await login.getToken();

    if (flap === null || !token) {
      return false;
    }

    log(`flap position ${flap}`);
    const res = await fetch(config.flap.urls.position, {
      body: JSON.stringify({
        since: getDateString(),
        where: flapStateToApi[flap],
      }),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Invalid response');
    }

    const json = (await res.json()) as RequestPosition;
    const petId = Number(json.data?.pet_id);

    if (petId && petId === config.flap.petId) {
      return true;
    }

    login.forceReload();
    throw new Error('Position data not valid');
  } catch (ex: unknown) {
    log(ex);
    throw new Error('Unable to set position');
  }
};

export { setPosition };
