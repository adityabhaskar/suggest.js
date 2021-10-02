// eslint-disable-next-line no-undef
module.exports = {
    env: {
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: 12,
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint",
        "import"
    ],
    rules: {
        quotes: ["error", "double"],
        indent: ["error", 4, {
            SwitchCase: 1,
        }],
        "max-len": ["warn", 120],
        "arrow-parens": ["error", "as-needed"],
        "comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],
        "no-trailing-spaces": ["warn"],
    }
};
