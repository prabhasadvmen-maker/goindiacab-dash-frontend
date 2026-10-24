import React, { useState } from 'react';

// Stored photo URLs can be bad data (e.g. "http://..." placeholders, plain http). Rendering those triggers
// "mixed content" warnings and failed DNS lookups, so only valid https / data-image URLs are ever requested.
export const safeImageSrc = (url) => {
  if (typeof url !== 'string') return '';
  const value = url.trim();
  if (value.startsWith('data:image/')) return value;
  try {
    const u = new URL(value.replace(/^http:\/\//i, 'https://'));
    if (u.protocol !== 'https:') return '';
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return ''; // rejects "...", "localhost", bare labels
    return u.href;
  } catch {
    return '';
  }
};

// <img> that shows `fallback` instead of a broken image when the URL is unusable or fails to load.
export default function SafeImage({ src, fallback = null, ...props }) {
  const [failed, setFailed] = useState(false);
  const safe = safeImageSrc(src);
  if (!safe || failed) return fallback;
  return <img src={safe} loading="lazy" decoding="async" onError={() => setFailed(true)} {...props} />;
}
