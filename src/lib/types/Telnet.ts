interface TelnetOptionsDefault {
  echoLines?: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  initialLFCR?: boolean;
  shellPrompt?: string;
  stripShellPrompt?: boolean;
  timeout?: number;
}

interface TelnetOptions extends TelnetOptionsDefault {
  host: string;
  port: number;
}

export { TelnetOptions, TelnetOptionsDefault };
