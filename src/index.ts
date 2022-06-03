// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-floating-promises */
import { main as log } from './lib/log.js';
import * as flapDevice from './lib/flapDevice.js';
import * as flapState from './lib/flapState.js';
import * as server from './lib/server.js';

(async (): Promise<void> => {
  server.start();
  flapDevice.startUpdatingDeviceStatus();
  flapDevice.startUpdatingOnlineStatus();
  flapState.startUpdating();

  log('started');
})();
