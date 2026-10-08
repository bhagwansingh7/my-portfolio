import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';

export default function NotFound() {
  useSeo({ title: 'Page not found', description: 'The page you are looking for does not exist.' });
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-start justify-center pt-20">
      <p className="font-display text-7xl font-semibold text-accent sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">This page doesn’t exist</h1>
      <p className="mt-2 max-w-md text-muted">The link may be broken, or the page may have been moved or removed.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn btn-primary">Go to home page</Link>
        <Link to="/#projects" className="btn btn-secondary">See projects</Link>
      </div>
    </div>
  );
}
