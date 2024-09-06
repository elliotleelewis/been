/* v8 ignore start */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components/app';

import './styles.scss';

const container = document.querySelector('#app');

if (!container) {
	throw new Error('Cannot find root element: #app');
}

const root = createRoot(container);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);

/* v8 ignore end */
