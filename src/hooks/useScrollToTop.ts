import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = (): void => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);
};