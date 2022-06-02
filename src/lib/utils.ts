const wait = async (delay: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, delay));

export { wait };
