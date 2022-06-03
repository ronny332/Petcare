import { config } from './config.js';
import { FlapState } from './types/FlapState.js';
import lodash from 'lodash';
import { server as log } from './log.js';
import express, { NextFunction, Request, Response } from 'express';
import * as fhem from './fhem.js';
import * as flapDevice from './flapDevice.js';
import * as flapState from './flapState.js';
import * as position from './flapPosition.js';

const resError = {
  error: {
    message: 'request failed',
  },
};

const logQuery = (req: Request, _: Response, next: NextFunction): void => {
  let msg = `${req.method.toUpperCase()}: ${req.path}`;

  if (!lodash.isEmpty(req.query) && lodash.isPlainObject(req.query)) {
    msg += `?${lodash.map(req.query, (val: string, key: string) => `${key}=${val}`).join('&')}`;
  }

  log(msg);
  next();
};

const app = express();

app.use(express.json());
app.use(logQuery);

app.get('/flap/device/online', async (req, res) => {
  try {
    res.json({
      online: Boolean(flapDevice.getDeviceOnlineStatus(Boolean(Number(req.query.cached ?? 1))))
    });
  } catch (ex: unknown) {
    log(ex);
    res.status(500).json(resError);
  }
});

app.get('/flap/device/status', async (req, res) => {
  try {
    res.json(await flapDevice.getDeviceStatus(Boolean(Number(req.query.cached ?? 1))));
  } catch (ex: unknown) {
    log(ex);
    res.status(500).json(resError);
  }
});

app.get('/flap/state', async (req, res) => {
  try {
    res.json({
      state: await flapState.getState(Boolean(Number(req.query.cached ?? 1))),
    });
  } catch (ex: unknown) {
    log(ex);
    res.status(500).json(resError);
  }
});

app.post(
  '^/flap/state/:flap(open|closed)$',
  async (req: Request<{ flap: FlapState }>, res: Response) => {
    try {
      const { flap } = req.params;

      res.json({ flap });

      const skipUpdate = req.query.skipUpdate as string;

      if (!fhem.skipUpdate('fhem', skipUpdate)) {
        await fhem.setState(flap, 'server');
      }

      if (!fhem.skipUpdate('flap', skipUpdate)) {
        flapState.skipNextUpdate();
        await position.setPosition(flap);
      }
    } catch (ex: unknown) {
      if (!res.headersSent) {
        res.status(500).json(resError);
      }
      log(ex);
    }
  }
);

const start = async (): Promise<void> => {
  app.listen(config.server.port, () => {
    log(`server @:${config.server.port}`);
  });
};

export { start };
