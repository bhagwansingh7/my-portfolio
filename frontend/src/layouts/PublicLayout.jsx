import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { PortfolioProvider } from '../context/PortfolioContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';
import PageTransition from '../components/PageTransition';

function Shell() {
  const location = useLocation();
  // useOutlet keeps the *previous* page element mounted while it animates out.
  const outlet = useOutlet();

  useEffect(() => {
    // Let Home handle its own #hash scrolling; every other page starts at the top.
    if (location.pathname !== '/') window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-screen outline-none">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>{outlet}</PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <Cursor />
    </>
  );
}

export default function PublicLayout() {
  return (
    <PortfolioProvider>
      <Shell />
    </PortfolioProvider>
  );
}
