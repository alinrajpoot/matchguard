const isTest = import.meta.env.MODE === 'test'

export const sleep = (ms = 240) =>
  new Promise<void>((resolve) => setTimeout(resolve, isTest ? 0 : ms))

export const STAGE_MS = isTest ? 10 : 700
export const RUN_RESOLVE_MS = isTest ? 20 : 2400
export const ASSISTANT_MS = isTest ? 0 : 600
