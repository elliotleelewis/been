import forms from '@tailwindcss/forms';

// biome-ignore lint/style/noDefaultExport: Required structure for TailwindCSS
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
