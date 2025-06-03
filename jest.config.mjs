export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setupTests.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!bcrypt)"],
  coverageDirectory: "coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "middlewares/**/*.js",
    "models/**/*.js",
    "!**/node_modules/**",
  ],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)", "**/?(*.)+(spec|test).mjs"],
};
