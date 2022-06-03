import { config } from './config.js';
import fetch from 'node-fetch';
import { IntervalOptions } from './types/IntervalOptions.js';
import { flapState as log } from './log.js';
import { RequestDataPoint } from './types/RequestDataPoint.js';
import { RequestState } from './types/RequestState.js';
import { start as startInterval } from './interval.js';
import { FlapState, FlapStateCache } from './types/FlapState.js';
import * as fhem from './fhem.js';
import * as login from './flapLogin.js';

const intervalOptions: IntervalOptions = {
  delay: config.flap.delays.state.interval,
  initialize: true,
  name: 'state',
  retry: config.flap.delays.state.retry,
  skip: false
};

const state: FlapStateCache = {
  current: null,
};

const getState = async (cached: boolean): Promise<FlapState> => {
  if (state.current !== null && cached) {
    log(`flap state cached ${state.current}`);

    return state.current;
  }

  try {
    const token = await login.getToken();

    if (!token) {
      return null;
    }

    const res = await fetch(config.flap.urls.state, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
    });

    if (res.ok) {
      const json = (await res.json()) as RequestState;
      const dataPoints: RequestDataPoint[] | undefined =
        json.data?.movement?.datapoints;

      if (Array.isArray(dataPoints) && dataPoints.length > 0) {
        const dataPoint = dataPoints.at(-1)!;

        if ('from' in dataPoint) {
          state.current = 'active' in dataPoint ? 'open' : 'closed';

          log(`flap state ${state.current}`);

          return state.current;
        }
      }

      throw new Error('State data not valid');
    }

    state.current = null;
    login.forceReload();
    throw new Error('State data not available');
  } catch (ex: unknown) {
    log(ex);
    throw new Error('State not available');
  }
};

const singleUpdate = async (): Promise<void> =>
  fhem.setState(await getState(false), 'flap');

const skipNextUpdate = (): void => {
  intervalOptions.skip = true;
};

const skipsNextUpdate = (): boolean => intervalOptions.skip;

const startUpdating = async (): Promise<void> => startInterval(singleUpdate, intervalOptions);

export { getState, skipNextUpdate, skipsNextUpdate, startUpdating };
