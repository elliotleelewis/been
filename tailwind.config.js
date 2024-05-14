/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#fd7e14',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
