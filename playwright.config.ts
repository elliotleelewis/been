import { defineConfig } from "@playwright/test";

const URL_SERVE = "http://127.0.0.1:5173";
const URL_PREVIEW = "http://127.0.0.1:4173";
const isCi = process.env["CI"] !== undefined && process.env["CI"] !== "";
const URL = isCi ? URL_PREVIEW : URL_SERVE;

export default defineConfig({
	testDir: "./src/__e2e-test__",
	use: {
		baseURL: URL,
		trace: "on",
	},
	webServer: {
		command: "pnpm run preview",
		reuseExistingServer: !isCi,
		timeout: 10 * 1000,
		url: isCi ? URL_PREVIEW : URL_SERVE,
	},
});
