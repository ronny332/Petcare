import { TelnetOptions } from './Telnet.js';

interface Config {
  fhem: Fhem;
  flap: Flap;
  name: string;
  server: Server;
}

interface Fhem {
  deviceAlexa: string;
  deviceFhem: string;
  deviceStatus: string;
  updateEnabled: boolean;
  telnet: TelnetOptions;
}

interface Flap {
  deviceId: string;
  delays: Delays;
  emailAddress: string;
  householdId: number;
  password: string;
  petId: number;
  sleep: number;
  urls: Urls;
}

interface Delays {
  state: State;
  status: StatusTypes;
}

interface State {
  interval: number;
  retry: number;
}

interface Status {
  interval: number;
  retry: number;
}

interface StatusTypes {
  cache: number;
  device: Status;
  online: Status;
}

interface Urls {
  device: string;
  login: string;
  position: string;
  state: string;
}

interface Server {
  port: number;
  updateFhem: boolean;
}

export { Config };
