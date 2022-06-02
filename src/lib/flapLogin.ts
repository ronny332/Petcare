import { config } from './config.js';
import fetch from 'node-fetch';
import { flapLogin as log } from './log.js';
import { LoginToken } from './types/LoginToken.js';
import { RequestToken } from './types/RequestToken.js';

const token: LoginToken = {
  current: null,
};

const forceReload = (): void => {
  token.current = null;
};

const getToken = async (): Promise<string | null> => {
  if (token.current !== null) {
    return token.current;
  }

  log('login token');
  try {
    const res = await fetch(config.flap.urls.login, {
      body: JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        device_id: config.flap.deviceId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_address: config.flap.emailAddress,
        password: config.flap.password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Token not available, check login credentials');
    }

    const json = await res.json() as RequestToken | undefined;

    if (!json?.data?.token) {
      throw new Error('Token response received, but no token found');
    }

    token.current = json.data.token;

    return token.current;
  } catch (ex: unknown) {
    log(ex);
    throw new Error('Fetching login token failed');
  }
};

export { forceReload, getToken, token };
