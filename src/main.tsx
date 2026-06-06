import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/shrimp-mode/sw.js');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
