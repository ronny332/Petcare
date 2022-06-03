type FlapState = 'open' | 'closed' | null;

interface FlapStateCache {
  current: FlapState | null;
}

type FlapStateUpdateSource = 'alexa' | 'fhem' | 'flap' | 'server';

export { FlapState, FlapStateCache, FlapStateUpdateSource };
