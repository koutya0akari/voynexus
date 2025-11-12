/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname
  },
  plugins: ["@typescript-eslint"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "@next/next/no-img-element": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports"
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  overrides: [
    {
      files: ["**/*.{ts,tsx,mts,cts}"],
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    {
      files: ["public/**/*.js"],
      env: {
        browser: true,
        worker: true
      }
    }
  ]
};
