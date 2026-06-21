const SERVICE_WORKER_URL = '/sw.js';

function shouldRegisterServiceWorker() {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  return window.location.protocol === 'https:' || isLocalhost;
}

function announceUpdate(registration) {
  if (typeof window === 'undefined' || !registration) return;
  window.dispatchEvent(new CustomEvent('diagnosis-sw-update-ready', { detail: { registration } }));
}

function watchRegistration(registration) {
  if (!registration) return;

  if (registration.waiting && navigator.serviceWorker.controller) {
    announceUpdate(registration);
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        announceUpdate(registration);
      }
    });
  });
}

export function registerServiceWorker() {
  if (!shouldRegisterServiceWorker()) return;

  let controllerChangeNotified = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controllerChangeNotified) return;
    controllerChangeNotified = true;
    window.dispatchEvent(new CustomEvent('diagnosis-sw-controller-changed'));
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL)
      .then((registration) => {
        watchRegistration(registration);
        registration.update?.();
      })
      .catch((error) => {
        console.warn('Service worker registration skipped:', error);
      });
  });
}
