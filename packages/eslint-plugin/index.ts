import { rules } from './rules';

const configuration = {
  rules,
  configs: {
    recommended: {
      parser: '@typescript-eslint/parser',
      parserOptions: { sourceType: 'module' },
      rules: {
        '@sap-cloud-sdk/valid-tsdoc': 'error'
      }
    }
  }
};

export = configuration;
