import { useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function usePageVisibility() {
  const { setPageVisible, status, setStatus, isPageVisible } = useSessionStore();

  useEffect(() => {
    const handleChange = () => {
      const visible = document.visibilityState === 'visible';
      setPageVisible(visible);

      if (status === 'scanning') {
        if (!visible) {
          setStatus('hidden_paused');
        } else {
          setStatus('scanning');
        }
      }
    };

    document.addEventListener('visibilitychange', handleChange);
    return () => document.removeEventListener('visibilitychange', handleChange);
  }, [status, setPageVisible, setStatus]);

  return { isPageVisible };
}
