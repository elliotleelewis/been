import { defineConfig } from "@playwright/test";

const URL_SERVE = "http://127.0.0.1:5173";
const URL_PREVIEW = "http://127.0.0.1:4173";
const URL = process.env["CI"] ? URL_PREVIEW : URL_SERVE;

export default defineConfig({
	testDir: "./src/__e2e-test__",
	use: {
		baseURL: URL,
		trace: "on",
	},
	webServer: {
		command: "pnpm run preview",
		reuseExistingServer: !process.env["CI"],
		timeout: 10 * 1000,
		url: process.env["CI"]
			? "http://127.0.0.1:4173"
			: "http://127.0.0.1:5173",
	},
});
