import { Environment } from '../app/models/environment';

export const environment: Environment = {
	production: true,
	apiKeyMapbox: process.env.API_KEY_MAPBOX ?? '',
};
