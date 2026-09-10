import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
// Test current workspace source, never stale build artifacts.
export default defineConfig({test:{include:['src/**/*.test.ts','../mobile/src/**/*.test.ts']},resolve:{alias:Object.fromEntries(['types','validation','workflow','risk-engine'].map(name=>[`@geocredit/${name}`,resolve(__dirname,`../../packages/${name}/src/index.ts`)]))}});
