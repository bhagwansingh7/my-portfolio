// Spam protection architecture: an ordered list of independent checks. Add a check
// (e.g. a CAPTCHA token verifier or an external API) by appending a function that returns
// a reason string when the submission looks like spam, or null when it looks fine.
const checks = [
  // Honeypot: real visitors never see or fill the hidden "website" input.
  ({ honeypot }) => (honeypot ? 'honeypot' : null),
  // Link stuffing
  ({ message }) => ((message.match(/https?:\/\//gi) || []).length > 3 ? 'too-many-links' : null),
  // Very long runs of one character
  ({ message }) => (/(.)\1{29,}/.test(message) ? 'repeated-characters' : null),
];

const detectSpam = (submission) => {
  for (const check of checks) {
    const reason = check(submission);
    if (reason) return reason;
  }
  return null;
};

module.exports = { detectSpam };
