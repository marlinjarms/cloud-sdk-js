import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree
} from '@typescript-eslint/utils';
import {
  DocComment,
  DocExcerpt,
  DocParamBlock,
  DocParamCollection,
  TSDocParser
} from '@microsoft/tsdoc';

export default ESLintUtils.RuleCreator((name) => name)({
  name: 'valid-tsdoc',
  meta: {
    docs: {
      description: 'desc',
      recommended: 'error'
    },
    messages: {
      'no-doc-on-export-declaration': 'No documentation.',
      'missing-param': 'Missing parameter {{ name }}.',
      'exceeding-param': 'Excess parameter {{ name }}.',
      'missing-returns': 'Missing returns.'
    },
    schema: [],
    type: 'layout'
  },
  defaultOptions: [],
  create: (context) => ({
    ExportNamedDeclaration: (node: TSESTree.ExportNamedDeclaration) => {
      if (!getJsDoc(node.declaration, context)) {
        context.report({
          node,
          messageId: 'no-doc-on-export-declaration'
        });
      }

      if (node.declaration?.type === AST_NODE_TYPES.ClassDeclaration) {
        const publicMethods = node.declaration.body.body.filter(
          (classElement) =>
            classElement.type === AST_NODE_TYPES.MethodDefinition &&
            (!classElement.accessibility ||
              classElement.accessibility === 'public')
        ) as TSESTree.MethodDefinition[];

        publicMethods.forEach((method) => {
          if (!getJsDoc(method, context)) {
            context.report({
              node: method,
              messageId: 'no-doc-on-export-declaration'
            });
          }
        });
      }
    },

    FunctionDeclaration: (node: TSESTree.FunctionDeclaration) => {
      const jsDoc = getJsDoc(node, context);

      if (jsDoc) {
        checkFunction(jsDoc, node, context);
      }
    },
    MethodDefinition: (node: TSESTree.MethodDefinition) => {
      const fnNode = node.value;
      const jsDoc = getJsDoc(fnNode, context);

      if (jsDoc) {
        checkFunction(jsDoc, fnNode, context);
      }
    }
  })
});

function getJsDoc(
  node: TSESTree.BaseNode | null,
  context: any
): TSESTree.BlockComment | null {
  return node ? context.getSourceCode().getJSDocComment(node) : null;
}

function parseJsDoc(jsDoc: TSESTree.BlockComment): DocComment {
  const parser = new TSDocParser();
  const parserContext = parser.parseString(`/*${jsDoc.value}\n*/`);
  return parserContext.docComment;
}

function checkFunction(
  jsDoc: TSESTree.BlockComment,
  fnNode:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.TSEmptyBodyFunctionExpression,
  context: any
) {
  if (jsDoc) {
    const parsed = parseJsDoc(jsDoc);

    const { missing, exceeding } = checkParameters(
      fnNode.params,
      parsed.params
    );
    if (missing.length) {
      missing.forEach((paramName) =>
        context.report({
          loc: jsDoc.loc,
          messageId: 'missing-param',
          data: {
            name: paramName
          }
        })
      );
    }
    if (exceeding.length) {
      exceeding.forEach((param) => {
        context.report({
          loc: getLoc(param),
          messageId: 'exceeding-param',
          data: {
            name: param.parameterName
          }
        });
      });
    }

    const returnStatement = fnNode.body?.body.find(
      (statement) => statement.type === AST_NODE_TYPES.ReturnStatement
    );

    if (returnStatement && !parsed.returnsBlock) {
      context.report({
        loc: jsDoc.loc,
        messageId: 'missing-returns'
      });
    }
  }
}

function checkParameters(
  params: TSESTree.Parameter[],
  docParams: DocParamCollection
): { missing: string[]; exceeding: DocParamBlock[] } {
  const paramNames = params.reduce(
    (names: string[], param) =>
      isNamedParam(param) ? [...names, param.name] : names,
    []
  );
  const docParamNames = docParams.blocks.reduce(
    (names: string[], param) => [...names, param.parameterName],
    []
  );

  const missing = paramNames.filter((name) => !docParamNames.includes(name));
  const exceeding = docParams.blocks.filter(
    ({ parameterName }) => !paramNames.includes(parameterName)
  );

  return { missing, exceeding };
}

function isNamedParam(param: TSESTree.Parameter): param is TSESTree.Identifier {
  return param.type === AST_NODE_TYPES.Identifier;
}

function getLoc(
  param: DocParamBlock
): TSESTree.SourceLocation | TSESTree.Position {
  const tagRange = param.blockTag.getTokenSequence().getContainingTextRange();
  const start = tagRange.getLocation(tagRange.pos - 1);
  const paramNameExcerpt = param
    .getChildNodes()
    .find(
      (node) => (node as DocExcerpt).excerptKind === 'ParamBlock_ParameterName'
    ) as DocExcerpt | undefined;

  if (paramNameExcerpt) {
    const nameRange = paramNameExcerpt.content.getContainingTextRange();

    const end = nameRange.getLocation(nameRange.end - 1);
    return { start, end };
  }

  return start;
}
