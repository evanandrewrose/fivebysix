/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@api/(.*)$": "<rootDir>/../api/$1",
    "^lib/(.*)$": "<rootDir>/lib/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
