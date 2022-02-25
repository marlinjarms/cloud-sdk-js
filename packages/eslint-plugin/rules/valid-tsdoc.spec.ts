import { TSESLint } from '@typescript-eslint/utils';
import rule from './valid-tsdoc';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser')
});

ruleTester.run('valid-tsdoc', rule, {
  valid: [
    {
      name: 'parameters match documented parameters',
      code: `
        /**
         * @param a - a
         * @param b - b
         */
        export function test(a: string, b: number) {}
        `
    },
    {
      name: 'is not exported and has no documentation',
      code: `
      function test(a: string, b: number) {}
      `
    },
    {
      name: 'is not exported class and has no documentation',
      code: `
      class MyClass {}
      `
    },
    {
      name: 'is public method of not exported class and has no documentation',
      code: `
      class MyClass {
        publicMethod() {}
      }
      `
    }
  ],
  invalid: [
    {
      name: 'is exported and has no documentation',
      code: `
      export function test(a: string, b: number) {}
      `,
      errors: [
        {
          messageId: 'no-doc-on-export-declaration'
        }
      ]
    },
    {
      name: 'has missing parameter',
      code: `
      /**
       * @param a a
       */
      export function test(a: string, b: number) {}
      `,
      errors: [
        {
          messageId: 'missing-param'
        }
      ]
    },
    {
      name: 'has excess parameter',
      code: `
      /**
       * @param a - a
       * @param b - b
       * @param c - c
       */
      export function test(a: string, b: number) {}
      `,
      errors: [
        {
          messageId: 'exceeding-param'
        }
      ]
    },
    {
      name: 'has renamed parameter',
      code: `
      /**
       * @param a - a
       */
      export function test(b: string) {}
      `,
      errors: [
        {
          messageId: 'missing-param'
        },
        {
          messageId: 'exceeding-param'
        }
      ]
    },
    {
      name: 'is exported class and has no documentation',
      code: `
      export class MyClass {}
      `,
      errors: [
        {
          messageId: 'no-doc-on-export-declaration'
        }
      ]
    },
    {
      name: 'is public method of exported class and has no documentation',
      code: `
      /**
       * MyClass
       */
      export class MyClass {
        publicMethod() {}
      }
      `,
      errors: [
        {
          messageId: 'no-doc-on-export-declaration'
        }
      ]
    }
  ]
});
