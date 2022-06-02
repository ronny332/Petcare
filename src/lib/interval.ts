import { IntervalOptions } from './types/IntervalOptions.js';
import { interval as log } from './log.js';
import { wait } from './utils.js';

type Callback = () => Promise<void>;

interface Interval {
  cb: Callback;
  interval: ReturnType<typeof setTimeout> | null;
  promise: Promise<void> | null;
}

const intervals: Interval[] = [];

const get = (cb: Callback): Interval | null =>
  intervals.find(interval => interval.cb === cb) ?? null;

const clear = (interval: Interval): void => {
  if (interval.interval !== null) {
    clearInterval(interval.interval);
    intervals.splice(intervals.indexOf(interval), 1);
  }
};

const set = (cb: Callback, opts: IntervalOptions): Interval => {
  let interval = get(cb);

  if (interval !== null) {
    return interval;
  }

  interval = {
    cb,
    interval: null,
    promise: null,
  };

  interval.promise = new Promise(async (_, reject) => {
    if (opts.initialize) {
      try {
        await cb();
      } catch (ex: unknown) {
        reject(ex);

        return;
      }
    }

    interval!.interval = setInterval(async () => {
      try {
        if (opts.skip) {
          // eslint-disable-next-line no-param-reassign
          opts.skip = false;

          return;
        }
        await cb();
      } catch (ex: unknown) {
        reject(ex);
      }
    }, opts.delay);
  });

  log(`new interval '${opts.name}' ${opts.delay}ms`);
  intervals.push(interval);

  return interval;
};

const create = async (cb: Callback, opts: IntervalOptions): Promise<void> => {
  let interval = get(cb);

  if (interval !== null) {
    log('clear interval');
    clear(interval);
  }

  interval = set(cb, opts);

  return interval.promise!;
};

const start = async (cb: Callback, opts: IntervalOptions): Promise<void> => {
  for (;;) {
    try {
      await create(cb, opts);
    } catch (ex: unknown) {
      log(ex);
    }

    await wait(opts.retry);
    log('retrying');
  }
};

export { start };
