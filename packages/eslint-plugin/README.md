# @sap-cloud-sdk/eslint-plugin

This is a private package.
It serves to check TSDoc comments for correctness.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@sap-cloud-sdk/eslint-plugin`:

```sh
npm install @sap-cloud-sdk/eslint-plugin --save-dev
```

## Usage

Add `@sap-cloud-sdk` to the plugins section of your `.eslintrc` configuration file. You can omit the `/eslint-plugin` suffix:

```json
{
  "plugins": ["@sap-cloud-sdk"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@sap-cloud-sdk/eslint-plugin/rule-name": 2
  }
}
```

## Supported Rules

1. report missing docs on exported function
2. report on doc correctness:
   - for functions without `@internal` modifier:
     - missing (type-)parameter docs
     - exceeding (type-)parameter docs
     - no return type docs (if function returns something)
   - for functions with `@internal` modifier:
     - exceeding (type-)parameter docs

Considerations:

- What happens in the following cases:

  ```ts
  // Variadic arguments
  function fn(...param: string[]) {}

  // destructured parameters
  function fn({ param }: SomeType) {}

  // inline types
  function fn(param: { a: string; b: number }) {}

  // overrides
  ```

- Things to be covered (might not be complete):
  - exported functions
  - public methods of exported classes
  - exported variables
  - public properties of exported classes
  - exported interfaces + their properties
  - exported types + their properties
  - exported enums + their properties
  - properties of exported objects?
  - named exports
  - default exports
