/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#f06d02',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
