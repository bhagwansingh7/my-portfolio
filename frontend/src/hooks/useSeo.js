import { useEffect } from 'react';

const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/** Updates <title>, description and Open Graph tags for the current page. */
export default function useSeo({ title, description, image, type = 'website' }) {
  useEffect(() => {
    if (title) document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', window.location.href);
    if (image) setMeta('property', 'og:image', /^https?:/.test(image) ? image : `${window.location.origin}${image}`);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', window.location.origin + window.location.pathname);
  }, [title, description, image, type]);
}
