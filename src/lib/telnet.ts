// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-use-before-define */
import { config } from './config.js';
import lodash from 'lodash';
import { telnet as log } from './log.js';
import { Mutex } from 'async-mutex';
import { Telnet } from 'telnet-client';
import { wait } from './utils.js';
import { Socket, SocketReadyState } from 'node:net';
import { TelnetOptions, TelnetOptionsDefault } from './types/Telnet.js';

let connection: Telnet | undefined = new Telnet();
const mutex = new Mutex();

const telnetDefaultOptions: TelnetOptionsDefault = {
  echoLines: 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  initialLFCR: true,
  stripShellPrompt: true,
  timeout: 10_000,
};

let telnetOptions: TelnetOptions | null = null;

let closeTimeout: ReturnType<typeof setInterval> | null = null;

const clean = async (): Promise<void> => {
  try {
    if (connection !== undefined && typeof connection.getSocket === 'function') {
      const socket = connection.getSocket() as Socket | undefined;

      if (socket !== undefined && !socket.destroyed) {
        socket.destroy();
      }
    }
  } catch (ex: unknown) {
    log(ex);
  }
};

const close = async (force: boolean): Promise<void> => {
  if (closeTimeout) {
    clearInterval(closeTimeout);
    closeTimeout = null;
  }

  closeTimeout = setTimeout(async () => {
    if (!await isOpen()) {
      return;
    }

    const release = await mutex.acquire();

    try {
      try {
        log('closing connection');
        await connection?.end();

        if (force) {
          await clean();
        }
      } catch (ex: unknown) {
        log(ex);
      } finally {
        connection = new Telnet();
      }
    } finally {
      release();
    }
  }, force ? 0 : 2_500);
};

const createOptions = (opts: TelnetOptions): TelnetOptions => lodash.merge({ ...telnetDefaultOptions }, opts);

const setOptions = (opts: TelnetOptions): void => {
  telnetOptions = opts;
};

const exec = async (cmd: string): Promise<string | null> => {
  await close(false);

  const release = await mutex.acquire();

  try {
    try {
      if (!await isOpen()) {
        await open();
      }

      log('running command', cmd);

      const result = (await connection?.exec(cmd) ?? '').
        replace(config.fhem.telnet.shellPrompt!, '').
        trim();

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

const getOpenState = async (): Promise<SocketReadyState> => {
  if (connection !== undefined) {
    const socket = connection.getSocket() as Socket | undefined;

    if (socket) {
      return socket.readyState;
    }
  }

  return 'closed';
};

const isOpen = async (): Promise<boolean> => {
  let state = await getOpenState();

  if (state === 'open') {
    return true;
  }

  if (state === 'opening') {
    for (let i = 0; i < 10; i++) {
      await wait(250);
      state = await getOpenState();

      if (state === 'open') {
        return true;
      }
    }
  }

  await clean();

  return false;
};

const open = async (): Promise<void> => {
  if (await isOpen()) {
    return;
  }
  log('opening connection');

  try {
    connection = new Telnet();
    await connection.connect(telnetOptions);
  } catch (ex: unknown) {
    log(ex);
    await close(true);

    const retry = 2_000;

    log(`connection failed, delaying by ${retry}ms`);
    await wait(retry);

    throw new Error('connection failed, allowing new connection');
  }
};

export { createOptions, exec, setOptions };
