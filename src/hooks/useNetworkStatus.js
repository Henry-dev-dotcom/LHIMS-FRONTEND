import { useEffect, useMemo, useState } from 'react';

function readNetworkState() {
  if (typeof navigator === 'undefined') {
    return { online: true, effectiveType: '', saveData: false, downlink: null };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    online: navigator.onLine !== false,
    effectiveType: connection?.effectiveType || '',
    saveData: Boolean(connection?.saveData),
    downlink: typeof connection?.downlink === 'number' ? connection.downlink : null
  };
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState(() => readNetworkState());

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const sync = () => setNetworkState(readNetworkState());

    window.addEventListener('online', sync, { passive: true });
    window.addEventListener('offline', sync, { passive: true });
    connection?.addEventListener?.('change', sync, { passive: true });

    sync();

    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
      connection?.removeEventListener?.('change', sync);
    };
  }, []);

  return useMemo(() => {
    const slowConnection = ['slow-2g', '2g'].includes(networkState.effectiveType) || networkState.saveData;
    return { ...networkState, slowConnection };
  }, [networkState]);
}
