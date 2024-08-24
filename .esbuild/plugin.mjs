import dotenv from 'dotenv';

dotenv.config();

const envVars = ['API_KEY_MAPBOX'];

export default {
	name: 'define-vars',
	setup: (build) => {
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
