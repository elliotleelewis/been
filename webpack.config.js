const dotenvWebpack = require('dotenv-webpack');

module.exports = (cfg) => {
	cfg.plugins.push(
		new dotenvWebpack({
			systemvars: true,
		}),
	);

	return cfg
};
