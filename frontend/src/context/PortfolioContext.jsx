import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const PortfolioContext = createContext(null);
const initial = { status: 'loading', portfolio: null, skills: [], projects: [], socials: [] };

/** Loads all public content once; every public section reads from here (no hardcoded personal data). */
export function PortfolioProvider({ children }) {
  const [state, setState] = useState(initial);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    const [p, s, pr, so] = await Promise.allSettled([
      api.get('/portfolio'), api.get('/skills'), api.get('/projects'), api.get('/social-links'),
    ]);
    if (p.status === 'rejected') {
      setState({ ...initial, status: 'error' });
      return;
    }
    setState({
      status: 'ready',
      portfolio: p.value.data,
      skills: s.status === 'fulfilled' ? s.value.data : [],
      projects: pr.status === 'fulfilled' ? pr.value.data : [],
      socials: so.status === 'fulfilled' ? so.value.data : [],
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export const usePortfolio = () => useContext(PortfolioContext);
