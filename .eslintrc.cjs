module.exports = {
  root: true,
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:unicorn/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "simple-import-sort", "import", "unicorn"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2021,
    project: ["./tsconfig.json", "./tsconfig.eslint.json"],
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: "**/tsconfig.json",
      },
    },
  },
  ignorePatterns: ["*.d.ts"],
  rules: {
    "arrow-body-style": "off",
    "object-curly-spacing": "off",
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "no-constant-condition": [
      "error",
      {
        checkLoops: false,
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.config.js",
          "**/*.config.cjs",
          "**/*.config.js",
          "**/*.config.ts",
          "scripts/**/*.js",
        ],
      },
    ],
    "react/function-component-definition": [
      2,
      {namedComponents: "arrow-function"},
    ],
    "react/require-default-props": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "simple-import-sort/imports": "error",
    "unicorn/prefer-node-protocol": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/no-array-for-each": "off",
    "jsx-a11y/label-has-associated-control": ["error", {assert: "either"}],
  },
  overrides: [
    {
      files: ["*.js", "*.cjs"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "unicorn/prefer-module": "off",
      },
    },
  ],
};
