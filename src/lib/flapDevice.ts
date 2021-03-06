import { config } from './config.js';
import fetch from 'node-fetch';
import { IntervalOptions } from './types/IntervalOptions.js';
import { flapDevice as log } from './log.js';
import { start as startInterval } from './interval.js';
import {
  FlapStatus,
  FlapStatusCache,
  FlapStatusData,
  FlapStatusOnlineState,
} from './types/FlapDevice.js';
import * as fhem from './fhem.js';
import * as login from './flapLogin.js';

const device: FlapStatusCache = {
  current: null,
  date: null
};

const intervalOptionsDeviceStatus: IntervalOptions = {
  delay: config.flap.delays.status.device.interval,
  initialize: true,
  name: 'device status',
  retry: config.flap.delays.status.device.retry,
  skip: false
};

const intervalOptionsOnlineStatus: IntervalOptions = {
  delay: config.flap.delays.status.online.interval,
  initialize: true,
  name: 'online status',
  retry: config.flap.delays.status.online.retry,
  skip: false
};

const cacheIsOutdated = (): boolean => !device.date || Number(device.date) + config.flap.delays.status.cache < Number(Date.now());

const getDeviceStatus = async (cached: boolean): Promise<FlapStatus | null> => {
  if (!cacheIsOutdated() && cached) {
    log('flap device status cached');

    return device.current;
  }

  try {
    const token = await login.getToken();

    if (!token) {
      return null;
    }

    log(`flap device status`);
    const res = await fetch(config.flap.urls.device, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Invalid response');
    }

    const json = (await res.json()) as FlapStatusData;

    const data = json.data.find(dev => 'parent' in dev);

    device.current = data ?? null;
    device.date = new Date();

    return device.current;
  } catch (ex: unknown) {
    log(ex);
    throw new Error('Unable to get device status');
  }
};

const getDeviceOnlineStatus = async (cached: boolean): Promise<FlapStatusOnlineState> => {
  const status = await getDeviceStatus(cached);

  return status?.status.online ?? null;
};

const runUpdateDeviceStatus = async (): Promise<void> => {
  await fhem.setDeviceStatus(await getDeviceStatus(true));
};

const runUpdateOnlineStatus = async (): Promise<void> => {
  await fhem.setOnlineStatus(await getDeviceOnlineStatus(true));
};

const startUpdatingDeviceStatus = async (): Promise<void> => startInterval(runUpdateDeviceStatus, intervalOptionsDeviceStatus);

const startUpdatingOnlineStatus = async (): Promise<void> => startInterval(runUpdateOnlineStatus, intervalOptionsOnlineStatus);

export { getDeviceOnlineStatus, getDeviceStatus, startUpdatingDeviceStatus, startUpdatingOnlineStatus };
