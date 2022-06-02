import { config } from './config.js';
import { FlapState } from './types/FlapState.js';
import { server as log } from './log.js';
import express, { Request, Response } from 'express';
import * as fhem from './fhem.js';
import * as flapDevice from './flapDevice.js';
import * as flapState from './flapState.js';
import * as position from './flapPosition.js';

const app = express();

const resError = {
  error: {
    message: 'request failed',
  },
};

app.use(express.json());

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

      flapState.skipNextUpdate();
      await position.setPosition(flap);

      const skipUpdate =
        'skipUpdate' in req.query && req.query.skipUpdate === '1';

      if (!skipUpdate && config.server.updateFhem) {
        await fhem.setState(flap);
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
