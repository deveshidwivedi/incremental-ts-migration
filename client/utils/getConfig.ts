type GetConfigOptions = {
  warn?: boolean;
};

/**
 * Returns config item from environment
 */
function getConfig(key: string, options: GetConfigOptions = { warn: !isTestEnvironment() }): string | undefined {
  if (key == null) {
    throw new Error('"key" must be provided to getConfig()');
  }

  const env: Record<string, string | undefined> =
    (typeof global !== 'undefined' ? (global as any) : window)?.process?.env || {};

  const value = env[key];

  if (value == null && options?.warn !== false) {
    console.warn(`getConfig("${key}") returned null`);
  }

  return value;
}

export function isTestEnvironment(): boolean {
  return getConfig('NODE_ENV', { warn: false }) === 'test';
}

export default getConfig;
