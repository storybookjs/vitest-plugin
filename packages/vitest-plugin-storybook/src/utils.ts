import type { SupportedRenderers } from "./types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type RendererSpecificTemplates = {
	storybookPackage: string;
	testingLibraryPackage: string;
	render: (composedStory: string) => string;
};

export const PACKAGES_MAP = {
	react: {
		storybookPackage: "@storybook/react",
		testingLibraryPackage: "@testing-library/react",
		render: (composedStory) => `__render(<${composedStory} />)`,
	},
	vue3: {
		storybookPackage: "@storybook/vue3",
		testingLibraryPackage: "@testing-library/vue",
		render: (composedStory) => `__render(${composedStory})`,
	},
	svelte: {
		storybookPackage: "@storybook/svelte",
		testingLibraryPackage: "@testing-library/svelte",
		render: (composedStory) =>
			`__render(${composedStory}.Component, ${composedStory}.props)`,
	},
} satisfies Record<SupportedRenderers, RendererSpecificTemplates>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const log = (...args: any) => {
	if (process.env.DEBUG || process.env.DEBUG === "storybook") {
		console.log("🟡 ", ...args);
	}
};

const readMainConfig = async (configDirPath: string) => {
	// check whether the main config file is .ts or .js or .mjs or .cjs
	const extensions = [".ts", ".js", ".mjs", ".cjs"];
	// test for each extension and return the path if it exists
	for (const ext of extensions) {
		const mainConfigPath = join(configDirPath, `main${ext}`);
		try {
			return readFile(mainConfigPath, "utf-8");
		} catch (err) {}
	}
};

// Ideally the extraction should be done with CSF tools and AST parsing
// But for now we just read the contents of the main config file and apply regexes
export const extractRenderer = async (
	configDirPath: string,
): Promise<
	| {
			renderer: SupportedRenderers;
	  }
	| {
			error: string;
	  }
> => {
	try {
		log(`Reading main config file at ${configDirPath}...`);
		const mainConfig = await readMainConfig(configDirPath);
		if (!mainConfig) {
			return {
				error: `Could not read the main config file at ${configDirPath}`,
			};
		}

		const regexes = [
			// framework: '@storybook/react-vite'
			/framework:\s*['"]([^'"]+)['"]/,
			// framework: { name: '@storybook/react-vite', ... }
			/framework:\s*\{\s*name:\s*['"]([^'"]+)['"]/,
			// framework: getAbsolutePath('@storybook/react-vite')
			/framework:\s*\w+\(['"]([^'"]+)['"]/,
			// framework: { name: getAbsolutePath('@storybook/react-vite'), ... }
			/framework:\s*\{\s*name:\s*\w+\(['"]([^'"]+)['"]/,
		];

		let framework = null;

		for (const regex of regexes) {
			const match = regex.exec(mainConfig);
			if (match) {
				framework = match[1];
				break;
			}
		}

		if (framework?.includes("react")) return { renderer: "react" };
		if (framework?.includes("vue")) return { renderer: "vue3" };
		if (framework?.includes("svelte")) return { renderer: "svelte" };

		return {
			error: `Extracted an unsupported renderer: "${framework}". Supported renderers are: ${Object.keys(
				PACKAGES_MAP,
			)}`,
		};
	} catch (err) {
		return {
			error: `An unexpected error occurred: ${err}`,
		};
	}
};
