// Everything stored by this API is plain text. React escapes it on render, and we also strip
// markup on the way in so nothing script-like ever reaches the database.
const stripHtml = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
};

const nullIfEmpty = (v) => (v === undefined || v === null || v === '' ? null : v);

module.exports = { stripHtml, nullIfEmpty };
