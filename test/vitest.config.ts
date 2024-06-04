import { storybookTest } from "@storybook/experimental-vitest-plugin";
import Inspect from "vite-plugin-inspect";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
	viteConfig,
	defineConfig({
		plugins: [
			Inspect({ build: true, outputDir: ".vite-inspect" }),
			storybookTest({
				renderer: "react",
			}),
		],
		test: {
			browser: {
				name: "chrome",
			},
			environment: "happy-dom",
			includeSource: ["./src/**/*.stories.[jt]sx?"],
		},
	}),
);
