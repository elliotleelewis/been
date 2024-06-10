import type { Plugin, PluginBuild } from 'esbuild';

require('dotenv').config();

const envVars = ['API_KEY_MAPBOX'];

const plugin: Plugin = {
	name: 'define-vars',
	setup: (build: PluginBuild) => {
		const { define } = build.initialOptions;
		if (define) {
			envVars.forEach((envVar) => {
				if (process.env[envVar]) {
					define[`process.env.${envVar}`] = JSON.stringify(
						process.env[envVar],
					);
				} else {
					console.warn('Missing ENV Variable:', envVar);
				}
			});
		}
	},
};

module.exports = plugin;
