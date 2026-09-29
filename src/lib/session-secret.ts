const minimumSessionSecretLength = 32;

const configuredSessionSecret = process.env.SESSION_SECRET;

if (!configuredSessionSecret || configuredSessionSecret.length < minimumSessionSecretLength) {
  throw new Error(`SESSION_SECRET must be at least ${minimumSessionSecretLength} characters long.`);
}

export const sessionSecret = new TextEncoder().encode(configuredSessionSecret);