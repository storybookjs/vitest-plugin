import MagicString from 'magic-string'
import typescript from 'typescript'
import type { InternalOptions } from './types'
import { PACKAGES_MAP } from './utils'

// Main transform function for the Vitest plugin
export async function transform({
  code,
  id,
  options,
}: {
  code: string
  id: string
  options: InternalOptions
}) {
  const isStoryFile = /\.stor(y|ies)\./.test(id)
  if (!isStoryFile) {
    return code
  }
  const sourceFile = typescript.createSourceFile(
    id,
    code,
    typescript.ScriptTarget.ESNext,
    true
  )

  const s = new MagicString(code)

  const tagsFilter = `{ include: ${JSON.stringify(options.tags.include)}, exclude: ${JSON.stringify(options.tags.exclude)}, skip: ${JSON.stringify(options.tags.skip)} }`

  let metaExportName = '__STORYBOOK_META__'

  const modifyMeta = (node: typescript.ExportAssignment) => {
    const exportExpression = node.expression

    if (typescript.isIdentifier(exportExpression)) {
      // Handle default export as a variable, e.g. "export default meta"
      // get the name of the variable to use later when appending composeStory below each story
      metaExportName = exportExpression.getText()
    } else if (typescript.isObjectLiteralExpression(exportExpression)) {
      // Handle inline default export, e.g. "export default {}"
      // rewrite it to const __STORYBOOK_META__ = {}; export default __STORYBOOK_META__;
      const defaultExportCode = code.substring(
        exportExpression.getStart(),
        exportExpression.getEnd()
      )
      const insertPos = node.getStart()
      s.overwrite(
        insertPos,
        node.getEnd(),
        `const ${metaExportName} = ${defaultExportCode};\nexport default ${metaExportName};`
      )
    }
  }

  const defaultExportNode = sourceFile.statements.find((node) =>
    typescript.isExportAssignment(node)
  ) as typescript.ExportAssignment

  if (!defaultExportNode) {
    throw new Error(
      'The Storybook vitest plugin could not detect the meta (default export) object in the story file. \n\nPlease make sure you have a default export with the meta object. If you are using a different export format that is not supported, please file an issue with details about your use case.'
    )
  }

  modifyMeta(defaultExportNode)

  const addTestStatementToStory = (
    element: typescript.ExportSpecifier | typescript.VariableDeclaration,
    node: typescript.ExportDeclaration | typescript.VariableStatement
  ) => {
    const exportName = element.name.getText()
    const insertPos = node.end
    s.appendRight(
      insertPos,
      `\nmakeTest(composeStory(${exportName}, ${metaExportName}), ${tagsFilter}, "${exportName}");`
    )
  }

  // Traverse the AST and find all named exports
  const modifyStories = (node: typescript.Node) => {
    if (
      // defined stories like "export { Primary }"
      typescript.isExportDeclaration(node) &&
      node.exportClause &&
      typescript.isNamedExports(node.exportClause)
    ) {
      for (const element of node.exportClause.elements) {
        addTestStatementToStory(element, node)
      }
    } else if (
      // defined stories like "export const Primary = {}"
      typescript.isVariableStatement(node) &&
      node.modifiers?.some(
        (mod) => mod.kind === typescript.SyntaxKind.ExportKeyword
      )
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (typescript.isIdentifier(declaration.name)) {
          addTestStatementToStory(declaration, node)
        }
      }
    }

    typescript.forEachChild(node, modifyStories)
  }

  typescript.forEachChild(sourceFile, modifyStories)

  const metadata = PACKAGES_MAP[options.renderer]
  // Append the transformation code at the end of the file
  s.append(
    `
			import { composeStory } from '${metadata.storybookPackage}';
			import { makeTest } from '@storybook/experimental-vitest-plugin/dist/make-test';
		`
  )

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  }
}
