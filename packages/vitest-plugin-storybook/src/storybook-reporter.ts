import net from "net";
import { API_StatusUpdate, API_StatusValue } from "@storybook/types";
import execa from "execa";
import { TaskResultPack, TaskState, Vitest } from "vitest";
import { Reporter } from "vitest/reporters";
// @ts-expect-error types are missing
import waitOn from "wait-on";
import type { InternalOptions } from "./types";
import { log } from "./utils";

const stateToStatusMap = {
	fail: "error",
	run: "unknown",
	pass: "unknown",
	skip: "unknown",
	todo: "unknown",
	only: "unknown",
} as Record<TaskState, API_StatusValue>;

export class StorybookReporter implements Reporter {
	testStatusData: API_StatusUpdate = {};
	isStorybookReady = false;
	options: InternalOptions;
	ctx!: Vitest;

	constructor(options: InternalOptions) {
		this.options = options;
	}

	onInit(ctx: Vitest) {
		this.ctx = ctx;

		if (this.ctx.config.watch) {
			this.startStorybookIfNeeded().then(() => {
				log("Storybook is ready and resolved");
				this.isStorybookReady = true;
				this.requestStorybookStatusUpdate();
			});
		}
	}

	private async startStorybookIfNeeded(): Promise<void> {
		const { storybookPort: port, storybookScript } = this.options;

		await new Promise((resolve, reject) => {
			const server = net.createServer();

			server.once("error", (err: NodeJS.ErrnoException) => {
				log("Error when listening to port", port, err);
				if (err.code === "EADDRINUSE") {
					log("Storybook is already running");
					resolve(null);
				} else {
					reject(err);
				}
			});

			server.once("listening", async () => {
				server.close();

				const script = `${storybookScript} --ci`;
				log(`Watch mode detected, starting Storybook with command: ${script}`);

				try {
					execa.command(script, {
						stdio: "pipe",
						cwd: process.cwd(),
					});

					log("waiting on Storybook to be ready");
					await waitOn({
						resources: ["tcp:localhost:6006"],
					});
					log("Storybook is ready!");

					resolve(null);
				} catch (error: unknown) {
					log("Failed to start Storybook:", error);
					if ((error as { code: string }).code !== "EADDRINUSE") {
						throw error;
					}
					resolve(null);
				}
			});

			server.listen(port);
		});
	}

	private async requestStorybookStatusUpdate() {
		log("requestStorybookStatusUpdate!");
		if (!this.isStorybookReady) {
			log(
				"Storybook is not ready yet, will save the data for the next status update...",
			);
			return;
		}

		log("Sending Storybook status update: ", this.testStatusData);
		try {
			await fetch(`${this.options.storybookUrl}/experimental-status-api`, {
				method: "POST",
				body: JSON.stringify({
					data: this.testStatusData,
					id: "storybook-vitest-plugin",
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			// clear batched data after sending
			this.testStatusData = {};
		} catch (err) {
			if (this.options.debug) {
				log("Error updating status", err);
				throw err;
			}
		}
	}

	// The onTaskUpdate hook is called in batches for multiple tests (if they are too fast) - 40ms.
	// It receives an array of tuples: [taskId, taskResult, taskMeta]
	onTaskUpdate(packs: TaskResultPack[]) {
		if (!this.ctx.config.watch) return;

		for (const pack of packs) {
			const task = this.ctx.state.idMap.get(pack[0]);
			const taskResult = task?.result;

			if (task && task.type === "test" && taskResult?.state) {
				const status = stateToStatusMap[taskResult.state];

				// task.meta is either in pack[2] or in a task.meta, depending on the timing
				const meta = (task.meta || pack[2]) as { storyId: string };

				// Only update if it's pending or failed, to avoid noise
				this.testStatusData[meta.storyId] = {
					status,
					title: "Unit test",
					description: taskResult.errors?.[0]?.message || "",
				};
			}
		}

		if (Object.keys(this.testStatusData).length > 0) {
			this.requestStorybookStatusUpdate();
		}
	}
}
