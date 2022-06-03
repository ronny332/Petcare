import { TelnetOptions } from './Telnet.js';

interface ConfigJson {
  fhem: ConfigJsonFhem;
  flap: ConfigJsonFlap;
}

interface ConfigJsonFhem {
  deviceAlexa: string;
  deviceFhem: string;
  deviceStatus: string;
  telnet: TelnetOptions;
  updateEnabled: boolean;
}

interface ConfigJsonFlap {
  deviceId: string;
  emailAddress: string;
  householdId: number;
  password: string;
  petId: number;
}

export { ConfigJson };
