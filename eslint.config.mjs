import globals from "globals";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    {
        ignores: ["**/node_modules/", "**/main.js", "*.mjs"],
    },
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
            },
            ecmaVersion: 5,
            sourceType: "module",
        },

        rules: {
            "no-unused-vars": "off",

            "@typescript-eslint/no-unused-vars": ["error", {
                args: "none",
            }],

            "@typescript-eslint/ban-ts-comment": "off",
            "no-prototype-builtins": "off",
            "@typescript-eslint/no-empty-function": "off",
        },
    }
];