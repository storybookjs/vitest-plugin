import MagicString from 'magic-string'
import typescript from 'typescript'

// This function parses the source file to find all named exports.
function findNamedExports(sourceFile: typescript.SourceFile): string[] {
  const exportNames: string[] = []

  function visit(node: typescript.Node) {
    // Check if the node is a named export within an export declaration
    if (
      typescript.isExportDeclaration(node) &&
      node.exportClause &&
      typescript.isNamedExports(node.exportClause)
    ) {
      node.exportClause.elements.forEach((spec) => {
        exportNames.push(spec.name.text)
      })
    }

    // Handle VariableStatement, FunctionDeclaration, or ClassDeclaration
    if (
      (typescript.isVariableStatement(node) ||
        typescript.isFunctionDeclaration(node) ||
        typescript.isClassDeclaration(node)) &&
      node.modifiers
    ) {
      if (
        node.modifiers.some(
          (mod) => mod.kind === typescript.SyntaxKind.ExportKeyword
        )
      ) {
        if (typescript.isVariableStatement(node)) {
          node.declarationList.declarations.forEach((decl) => {
            if (typescript.isIdentifier(decl.name)) {
              exportNames.push(decl.name.text)
            }
          })
        } else if (node.name && typescript.isIdentifier(node.name)) {
          exportNames.push(node.name.text)
        }
      }
    }

    // Recursively visit all children of this node
    typescript.forEachChild(node, visit)
  }

  visit(sourceFile)
  return exportNames
}

// Main transform function for the Vitest plugin
export function transform(code: string, id: string) {
  const isStoryFile = /\.stor(y|ies)\./.test(id)
  if (!isStoryFile) return code
  const node = typescript.createSourceFile(
    id,
    code,
    typescript.ScriptTarget.ESNext
  )

  const exportNames = findNamedExports(node)
  // If there are no exports or it's not a story file, bail
  if (exportNames.length === 0) return code

  const s = new MagicString(code)
  const importPath = id.replace(/\.stories\.ts$/, '.stories')
  const testFilePath = id.replace(/\.stories\.ts$/, '.test.ts')
  const componentName =
    id
      .split('/')
      .pop()
      ?.replace(/\.stories\.tsx?$/, '') || 'Component'

  const tests = exportNames
    .map((name) => {
      return [
        `test('${name}', async () => {`,
        `  await ${name}Story.load();`,
        `  render(<${name}Story />);`,
        `  await ${name}Story.play?.();`,
        `});`,
      ].join('\n')
    })
    .join('\n\n')

  // Append the transformation code at the end of the file
  s.append(
    `\n// Virtual file generated: ${testFilePath}\n` +
      `import { composeStories } from '@storybook/react';\n` +
      `import * as stories from '${importPath}';\n` +
      `import { describe, test } from 'vitest';\n` +
      `import { render } from '@testing-library/react';\n\n` +
      `const { ${exportNames
        .map((v) => `${v}: ${v}Story`)
        .join(', ')} } = composeStories(stories);\n\n` +
      `describe('${componentName}', () => {\n${tests}\n});`
  )

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  }
}
