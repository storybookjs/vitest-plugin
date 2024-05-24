import { readFile, writeFile } from 'fs/promises'
import MagicString from 'magic-string'
import { join } from 'path'
import typescript from 'typescript'
import { Options } from './types'

// This function parses the source file to find all named exports and their positions.
function findNamedExports(
  sourceFile: typescript.SourceFile
): { name: string; pos: number }[] {
  const exportNames: { name: string; pos: number }[] = []

  function visit(node: typescript.Node) {
    // Check if the node is a named export within an export declaration
    if (
      typescript.isExportDeclaration(node) &&
      node.exportClause &&
      typescript.isNamedExports(node.exportClause)
    ) {
      node.exportClause.elements.forEach((spec) => {
        if (spec.name) {
          exportNames.push({ name: spec.name.text, pos: spec.name.getStart() })
        }
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
              exportNames.push({
                name: decl.name.text,
                pos: 10,
              })
            }
          })
        } else if (node.name && typescript.isIdentifier(node.name)) {
          exportNames.push({ name: node.name.text, pos: node.name.getStart() })
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
export async function transform({
  code,
  id,
  options,
}: {
  code: string
  id: string
  options: Options
}) {
  if (options.mode === 'storyshots') {
    if (id.includes('storybook.test')) {
      if (options.persistStoryshotsContent && code.includes('// @Persisted')) {
        return code
      }

      const s = new MagicString(code)
      const content = await readFile(
        join(__dirname, './storyshots.template.mjs'),
        'utf-8'
      )
      s.append(
        content
          .replace('{{shouldSnapshot}}', String(options.snapshot))
          .replace('@storybook/react', String(options.storybookPackage))
          .replace(
            '@testing-library/react',
            String(options.testingLibraryPackage)
          )
      )

      if (options.persistStoryshotsContent) {
        s.prepend('// @ts-nocheck\n')
        s.prepend('// @Persisted\n')
        await writeFile(id, s.toString())
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true, source: id }),
      }
    } else {
      return code
    }
  }

  const isStoryFile = /\.stor(y|ies)\./.test(id)
  if (!isStoryFile) {
    return code
  }
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
    .map(({ name, pos }) => {
      const testCode = [
        `test('${name}', async () => {`,
        `  await ${name}Story.load();`,
        `  render(<${name}Story />);`,
        `  await ${name}Story.play?.();`,
        `});`,
      ].join('\n')

      // Add source map location for the position of the export name
      s.addSourcemapLocation(pos)

      return testCode
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
        .map((v) => `${v.name}: ${v.name}Story`)
        .join(', ')} } = composeStories(stories);\n\n` +
      `describe('${componentName}', () => {\n${tests}\n});`
  )

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  }
}
