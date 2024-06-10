import type { Plugin, PluginBuild } from 'esbuild';

require('dotenv').config();

const envVars = ['API_KEY_MAPBOX'];

const plugin: Plugin = {
	name: 'define-vars',
	setup: (build: PluginBuild) => {
		const { define } = build.initialOptions;
		if (define) {
			console.log(Object.keys(process.env));
			envVars.forEach((envVar) => {
				if (process.env[envVar]) {
					define[`process.env.${envVar}`] = JSON.stringify(
						process.env[envVar],
					);
				}
			});
		}
	},
};

module.exports = plugin;
