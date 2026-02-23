// src/lib/env.server.ts
import "server-only";

/**
 * Server-only env helper
 */
export function assertEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}