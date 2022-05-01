const prettierrc = require("rc")("./prettier");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "react-app"],
  ignorePatterns: ["**/*.js"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "prettier/prettier": ["error", prettierrc],
    "no-restricted-imports": [
      "error",
      {
        patterns: [".*"],
      },
    ],
  },
};
