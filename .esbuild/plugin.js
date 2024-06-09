require('dotenv').config();

const plugin = {
	name: 'define-vars',
	setup(build) {
		const envVars = ['API_KEY_MAPBOX'];
		const { define } = build.initialOptions;
		if (define) {
			envVars.forEach((envVar) => {
				define[`process.env.${envVar}`] = JSON.stringify(
					process.env[envVar],
				);
			});
		}
	},
};

module.exports = plugin;
