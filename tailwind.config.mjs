import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/index.html', './src/**/*.{html,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#f06d02',
			},
		},
	},
	plugins: [forms],
};
