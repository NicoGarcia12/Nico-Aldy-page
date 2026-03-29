import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets/index.js';

const { createCjsPreset } = presets;

const config: Config = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/.angular/',
    '<rootDir>/dist/',
  ],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.d.ts'],
};

export default config;
