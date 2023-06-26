module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/jest-preprocess.js",
  },
};
