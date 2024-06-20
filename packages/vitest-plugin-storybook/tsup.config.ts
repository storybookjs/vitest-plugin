import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/viewports.ts"],
	format: ["esm", "cjs"],
	clean: true,
	dts: true,
});
