module.exports = {
  "plugins": ["jest"],
  "extends": ["eslint:recommended", "plugin:jest/recommended"],
  "parser": "babel-eslint",
  "parserOptions": { 
    "ecmaVersion": 2017
  },
  "env": {
    "node": true,
    "browser": true,
    "es6": true,
    "commonjs": true,
    "jest/globals": true
  },
  "globals": {
    "browser": false,
    "$": false,
    "$$": false,
    "SENTRY_DSN1": false,
    "SENTRY_DSN2": false
  },
  "rules": {
    "semi": ["error", "always"],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "arrow-parens": ["error", "as-needed"],
    "object-curly-spacing": ["error", "always"],
    "eqeqeq": ["error", "allow-null"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
    "curly": ["error"],
    "function-paren-newline": ["error", "multiline"],
    "no-unused-expressions": ["error", { "allowTernary": true }],
    "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
    "no-useless-escape": "off"
  }
};
