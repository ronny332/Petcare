type FlapState = 'open' | 'closed' | null;

interface FlapStateCache {
  current: FlapState | null;
}

export { FlapState, FlapStateCache };
