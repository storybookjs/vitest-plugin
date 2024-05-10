import { Project } from 'ts-morph'
import * as fs from 'fs'
import * as path from 'path'

const project = new Project()
const testFolder = './tests' // Directory where tests will be saved

// Read and parse files
function findStorybookFiles(startPath: string) {
  const files = fs.readdirSync(startPath)
  for (const file of files) {
    const filename = path.join(startPath, file)
    const stat = fs.lstatSync(filename)
    if (stat.isDirectory()) {
      findStorybookFiles(filename)
    } else if (
      filename.endsWith('.stories.ts') ||
      filename.endsWith('.stories.tsx')
    ) {
      transformFile(filename)
    }
  }
}

// Transform storybook files into test files
function transformFile(filePath: string) {
  const sourceFile = project.addSourceFileAtPath(filePath)
  const exports = sourceFile.getExportedDeclarations()
  const testFilePath = path.join(
    testFolder,
    path.basename(filePath).replace('.stories', '.test')
  )
  const importPath = filePath.replace(/\\/g, '/')

  let testFileContent = `
import { composeStories } from '@storybook/react';
import * as stories from '${importPath}';
import { describe, test } from 'vitest';
import { render } from '@testing-library/react';

const { ${Object.keys(exports).join(', ')} } = composeStories(stories);

describe('${path.basename(filePath)}', () => {
    `

  for (const [name] of exports) {
    testFileContent += `
  test('${name}', async () => {
    await ${name}.load();
    render(<${name} />);
    await ${name}.play?.();
  });
        `
  }

  testFileContent += `
});
    `

  fs.writeFileSync(testFilePath, testFileContent)
  console.log(`Generated test file: ${testFilePath}`)
}

// Ensure the test directory exists
if (!fs.existsSync(testFolder)) {
  fs.mkdirSync(testFolder, { recursive: true })
}

// Start the transformation process
findStorybookFiles('./src') // Adjust the path to where your storybook files are
