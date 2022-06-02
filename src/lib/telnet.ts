// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-use-before-define */
import lodash from 'lodash';
import { telnet as log } from './log.js';
import { Telnet } from 'telnet-client';
import { TelnetOptions, TelnetOptionsDefault } from './types/Telnet.js';

interface Command {
  cmd: string;
  promise: Promise<string | null> | null;
  resolve: ((value: string | null | PromiseLike<string | null>) => void) | null;
  reject: ((reason?: any) => void) | null;
}

const commands: Command[] = [];
const connection: Telnet = new Telnet();

const telnetDefaultOptions: TelnetOptionsDefault = {
  echoLines: 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  initialLFCR: true,
  stripShellPrompt: true,
  timeout: 10_000,
};

const createOptions = (opts: TelnetOptions): TelnetOptions => lodash.merge({ ...telnetDefaultOptions }, opts);

const cycle = async (): Promise<void> => {
  const removed: Command[] = [];

  for (const command of commands) {
    if (!isOpen()) {
      return;
    }
    try {
      log('running command', command.cmd);

      const result = (await connection.exec(command.cmd)).trim();

      if (command.resolve) {
        log('command result', result);
        command.resolve(result);
        removed.push(command);
      }
    } catch (ex: unknown) {
      log(ex);
      if (command.reject) {
        command.reject(new Error('cmd execution failed'));
      }
    }
  }

  if (removed.length > 0) {
    for (const command of removed) {
      const index = commands.indexOf(command);

      if (index >= 0) {
        log('removing cmd from queue', command.cmd);
        commands.splice(index, 1);
      }
    }
  }
};

let endTimeout: ReturnType<typeof setInterval> | null = null;

const end = async (force: boolean): Promise<void> => {
  if (endTimeout) {
    clearInterval(endTimeout);
    endTimeout = null;
  }

  endTimeout = setTimeout(async () => {
    try {
      log('closing connection');
      await connection.end();

      if (force) {
        await connection.destroy();
      }
    } catch (ex: unknown) {
      log(ex);
    }
  }, 2_500);
};

const exec = async (cmd: string): Promise<string | null> => {
  log('queuing command', cmd);

  try {
    if (isOpen()) {
      const command: Command = {
        cmd,
        promise: null,
        resolve: null,
        reject: null,
      };

      command.promise = new Promise((resolve, reject) => {
        command.resolve = resolve;
        command.reject = reject;
      });

      commands.push(command);

      setImmediate(async () => {
        await cycle();
      });

      return command.promise;
    }
  } catch (ex: unknown) {
    log(ex);
    throw new Error('FHEM command execution failed');
  }

  return null;
};

const isOpen = (): boolean => {
  const socket = connection.getSocket();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (socket !== undefined) {
    return socket.readyState === 'open';
  }

  return false;
};

const open = async (opts: TelnetOptions): Promise<void> => {
  if (isOpen()) {
    return;
  }

  const options = createOptions(opts);

  log('opening connection');

  try {
    await connection.connect(options);
  } catch (ex: unknown) {
    log(ex);
    await end(true);
  }
};

export { createOptions, end, exec, isOpen, open };
