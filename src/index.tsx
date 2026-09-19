import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './App';
import { ModalProvider } from './context/ModalContext';

let container = document.getElementById("app")!;
let root = createRoot(container)
root.render(
  <StrictMode>
    <ModalProvider>
      <App />
    </ModalProvider>
  </StrictMode>
);

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('./sw.js', import.meta.url), { type: 'module' })
      .then((registration) => {
        console.log('ServiceWorker registered successfully: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}