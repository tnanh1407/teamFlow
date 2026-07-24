import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  setupFiles: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
  extensionsToTreatAsEsm: [".ts"],
  verbose: true,
};

export default config;
