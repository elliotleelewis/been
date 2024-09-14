import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/app';
import './styles.css';

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
