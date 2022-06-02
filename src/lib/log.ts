import { config as conf } from './config.js';
import debugModule from 'debug';

const config = debugModule(`${conf.name}:fhem`);

const fhem = debugModule(`${conf.name}:fhem`);

const flapDevice = debugModule(`${conf.name}:flap:device`);

const flapLogin = debugModule(`${conf.name}:flap:login`);

const flapPosition = debugModule(`${conf.name}:flap:position`);

const flapState = debugModule(`${conf.name}:flap:state`);

const interval = debugModule(`${conf.name}:interval`);

const main = debugModule(`${conf.name}:main`);

const server = debugModule(`${conf.name}:server`);

export { config, fhem, flapDevice, flapLogin, flapPosition, flapState, interval, main, server };
