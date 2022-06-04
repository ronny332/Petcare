// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-use-before-define */
import { config } from './config.js';
import lodash from 'lodash';
import { telnet as log } from './log.js';
import { Mutex } from 'async-mutex';
import { Telnet } from 'telnet-client';
import { TelnetOptions, TelnetOptionsDefault } from './types/Telnet.js';

let connection: Telnet = new Telnet();
const mutex = new Mutex();

const telnetDefaultOptions: TelnetOptionsDefault = {
  echoLines: 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  initialLFCR: true,
  stripShellPrompt: true,
  timeout: 10_000,
};

let telnetOptions: TelnetOptions | null = null;

const createOptions = (opts: TelnetOptions): TelnetOptions => lodash.merge({ ...telnetDefaultOptions }, opts);

const setOptions = (opts: TelnetOptions): void => {
  telnetOptions = opts;
};

let endTimeout: ReturnType<typeof setInterval> | null = null;

const end = async (force: boolean): Promise<void> => {
  if (endTimeout) {
    clearInterval(endTimeout);
    endTimeout = null;
  }

  endTimeout = setTimeout(async () => {
    const release = await mutex.acquire();

    try {
      try {
        log('closing connection');
        await connection.end();

        if (force) {
          await connection.destroy();
        }
      } catch (ex: unknown) {
        log(ex);
      } finally {
        connection = new Telnet();
      }
    } finally {
      release();
    }
  }, 2_500);
};

const exec = async (cmd: string): Promise<string | null> => {
  const release = await mutex.acquire();

  await end(false);

  try {
    try {
      if (!isOpen()) {
        await open();
      }

      log('running command', cmd);

      const result = (await connection.exec(cmd)).replace(config.fhem.telnet.shellPrompt!, '').trim();

      log('command result', result);

      return result;
    } catch (ex: unknown) {
      log(ex);

      throw new Error('command execution failed');
    }
  } finally {
    release();
  }
};

const isOpen = (): boolean => {
  const socket = connection.getSocket();

  return Boolean(socket) && socket.readyState === 'open';
};

const open = async (): Promise<void> => {
  try {
    if (!isOpen()) {
      log('opening connection');

      try {
        connection = new Telnet();
        await connection.connect(telnetOptions);
      } catch (ex: unknown) {
        log(ex);
        await end(true);
      }
    }
  } catch (ex: unknown) {
    log(ex);
  }
};

export { createOptions, exec, setOptions };
