import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';

import './styles.scss';

const container = document.getElementById('app');

if (!container) {
	throw new Error('Cannot find root element: #app');
}

const root = createRoot(container);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
