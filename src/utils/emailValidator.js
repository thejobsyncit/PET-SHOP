/**
 * Strict RFC-compliant email validator with typo-domain protection for frontend forms.
 * Enforces valid format, domain labels, and rejects common malformed TLDs (e.g. .con).
 */
export const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const raw = email.trim();
  if (!raw) {
    return { isValid: false, message: 'Email address cannot be empty or whitespace only.' };
  }

  if (raw.length > 254) {
    return { isValid: false, message: 'Email address exceeds maximum length of 254 characters.' };
  }

  // Must have exactly one @ symbol
  const atParts = raw.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, message: 'Email must contain exactly one "@" symbol.' };
  }

  const [localPart, domainPart] = atParts;
  if (!localPart || !domainPart) {
    return { isValid: false, message: 'Email username and domain must not be empty.' };
  }

  if (localPart.length > 64) {
    return { isValid: false, message: 'Email username portion cannot exceed 64 characters.' };
  }

  // Standard local part pattern (letters, numbers, valid symbols, no consecutive dots)
  const localRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
  if (!localRegex.test(localPart)) {
    return { isValid: false, message: 'Email contains invalid characters before the "@" sign.' };
  }

  // Domain checks
  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..')) {
    return { isValid: false, message: 'Domain name contains invalid dot placement.' };
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return { isValid: false, message: 'Domain must include a valid top-level domain (e.g. .com, .org, .in).' };
  }

  // Check each domain label
  const labelRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  for (const label of domainLabels) {
    if (!labelRegex.test(label)) {
      return { isValid: false, message: `Domain label "${label}" is malformed.` };
    }
  }

  const tld = domainLabels[domainLabels.length - 1].toLowerCase();
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, message: 'Top-level domain extension must be at least 2 letters.' };
  }

  // Explicitly reject known invalid typo TLDs like .con instead of .com
  const INVALID_TYPO_TLDS = new Set([
    'con', 'cmo', 'cm', 'coom', 'comm', 'orgg', 'nett', 'eddu', 'gmaill', 'hotmial', 'yaho', 'inf'
  ]);
  if (INVALID_TYPO_TLDS.has(tld)) {
    return { 
      isValid: false, 
      message: `Invalid email domain extension ".${tld}". Did you mean ".com" or ".in"? Please check your email address.` 
    };
  }

  return { isValid: true, normalizedEmail: raw.toLowerCase(), normalized: raw.toLowerCase() };
};
