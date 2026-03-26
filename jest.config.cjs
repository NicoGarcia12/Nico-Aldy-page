const { createCjsPreset } = require("jest-preset-angular/presets");

module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/cypress/",
    "<rootDir>/.angular/",
    "<rootDir>/dist/",
  ],
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts", "!src/**/*.d.ts"],
};
