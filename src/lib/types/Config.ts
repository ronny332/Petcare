interface Config {
  fhem: ConfigFhem;
  flap: ConfigFlap;
}

interface ConfigFhem {
  deviceAlexa: string;
  deviceFhem: string;
  host: string;
  port: string;
  updateEnabled: boolean;
}

interface ConfigFlap {
  deviceId: string;
  emailAddress: string;
  householdId: number;
  password: string;
  petId: number;
}

export { Config };
