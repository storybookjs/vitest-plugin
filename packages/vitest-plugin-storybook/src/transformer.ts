import * as babel from "@babel/core";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { InternalOptions } from "./types";

// Main transform function for the Vitest plugin
export async function transform({
  code,
  id,
}: {
  code: string;
  id: string;
  options: InternalOptions;
}) {
  const isStoryFile = /\.stor(y|ies)\./.test(id);
  if (!isStoryFile) {
    return code;
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  babel.traverse(ast, {
    ExportNamedDeclaration(path) {
      const node = path.node;

      // Get the first export name
      const exportName =
        node.specifiers.length > 0
          ? node.specifiers[0].exported.name
          : node.declaration.declarations[0].id.name;

      // Create a test function call expression
      const testCall = t.expressionStatement(
        t.callExpression(t.identifier("test"), [
          t.stringLiteral(exportName),
          t.arrowFunctionExpression(
            [],
            t.blockStatement([
              t.expressionStatement(
                t.awaitExpression(
                  t.logicalExpression(
                    "&&",
                    t.memberExpression(
                      t.identifier(exportName),
                      t.identifier("play"),
                    ),
                    t.callExpression(
                      t.memberExpression(
                        t.identifier(exportName),
                        t.identifier("play"),
                      ),
                      [],
                    ),
                  ),
                ),
              ),
            ]),
            true, // This makes the arrow function async
          ),
        ]),
      );
      testCall.loc = node.loc;

      // Insert the test function call expression before the export declaration
      path.insertBefore(testCall);
    },
  });

  const { code: transformedCode, map } = generate.default(ast, {
    sourceMaps: true,
    sourceFileName: id,
  });

  return {
    code: transformedCode,
    map,
  };
}
