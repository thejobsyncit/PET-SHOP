/**
 * Strict RFC-compliant email validator with real TLD verification & domain structure protection.
 * Enforces valid format, recognized Top-Level Domains (TLD), non-numeric domain names,
 * readable domain patterns, and protects against typo and gibberish input.
 */

// Comprehensive set of legitimate global generic TLDs and official ccTLDs
const VALID_TLDS = new Set([
  // Core & Generic TLDs
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
  'co', 'io', 'ai', 'me', 'app', 'dev', 'tech', 'store', 'online', 'site', 'club',
  'live', 'shop', 'blog', 'care', 'pet', 'hub', 'press', 'news', 'design', 'art',
  'fit', 'law', 'vet', 'health', 'clinic', 'hospital', 'agency', 'global', 'center',
  'ltd', 'group', 'cloud', 'digital', 'services', 'solutions', 'company', 'media',
  'world', 'life', 'today', 'space', 'zone', 'expert', 'guru', 'host', 'vip', 'xyz',
  'top', 'website', 'team', 'network', 'systems', 'link', 'click', 'work', 'help',
  'tv', 'cc', 'mobi', 'asia', 'jobs', 'tel', 'travel', 'cat', 'coop', 'museum', 'aero',
  'page', 'eco', 'bio', 'one', 'run', 'red', 'fun', 'ink', 'win', 'bid', 'men', 'mom',
  'tax', 'ceo', 'car', 'auto', 'dog', 'community', 'support', 'consulting', 'management',
  'marketing', 'security', 'software', 'technology', 'foundation', 'charity', 'direct',
  'express', 'delivery', 'logistics', 'studio', 'academy', 'college', 'school', 'university',
  'training', 'education', 'degree', 'courses', 'works', 'build', 'house', 'home', 'city',
  'town', 'finance', 'money', 'fund', 'invest', 'bank', 'insure', 'insurance', 'legal',
  'medical', 'pharma', 'pharmacy', 'vets', 'pets', 'animals', 'dogs', 'market', 'boutique',
  'fashion', 'style', 'beauty', 'salon', 'spa', 'gym', 'yoga', 'pub', 'bar', 'cafe', 'food',
  'kitchen', 'events', 'photo', 'video', 'music', 'theater',

  // Official ISO 3166-1 alpha-2 Country Code TLDs (ccTLDs)
  'in', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'nl', 'sg', 'ae',
  'sa', 'nz', 'za', 'ch', 'se', 'es', 'it', 'kr', 'mx', 'pk', 'bd', 'lk', 'np', 'my',
  'ph', 'id', 'th', 'vn', 'ie', 'pl', 'at', 'be', 'dk', 'fi', 'no', 'pt', 'gr', 'cz',
  'ro', 'hu', 'il', 'hk', 'tw', 'ar', 'cl', 'pe', 'eg', 'ng', 'ke', 'gh', 'is', 'lu',
  'ee', 'lv', 'lt', 'si', 'sk', 'hr', 'bg', 'rs', 'ua', 'by', 'kz', 'uz', 'cy', 'mt',
  'qa', 'kw', 'om', 'bh', 'jo', 'lb', 'cr', 'pa', 'do', 'pr', 'uy', 'py', 'ec', 've',
  'bo', 'gt', 'sv', 'hn', 'ni', 'jm', 'tt', 'bs', 'bb', 'bz', 'gy', 'sr', 'mo', 'kh',
  'la', 'mm', 'mn', 'af', 'iq', 'sy', 'ye', 'ps', 'am', 'ge', 'az', 'md', 'ba', 'mk',
  'al', 'xk', 'ad', 'li', 'mc', 'sm', 'va', 'gi', 'je', 'gg', 'im', 'fo', 'gl', 'ax',
  'bm', 'ky', 'vg', 'vi', 'aw', 'cw', 'sx', 'ms', 'tc', 'vc', 'gd', 'lc', 'dm', 'kn',
  'ag', 'mu', 'sc', 're', 'yt', 'mg', 'zw', 'bw', 'na', 'sz', 'ls', 'mz', 'zm', 'mw',
  'rw', 'bi', 'so', 'dj', 'er', 'sd', 'ss', 'sn', 'gm', 'gn', 'gw', 'sl', 'lr', 'ci',
  'bf', 'ml', 'ne', 'tg', 'bj', 'cm', 'cf', 'td', 'cg', 'cd', 'ga', 'gq', 'st', 'ao',
  'cv', 'km', 'mr', 'pg', 'fj', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'ki', 'nr', 'pw',
  'fm', 'mh', 'ck', 'nu', 'tk', 'wf', 'as', 'gu', 'mp'
]);

// Common domain typos mapped to their intended correction
const COMMON_TYPO_DOMAINS = {
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaill.in': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.in': 'yahoo.in',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'icoud.com': 'icloud.com'
};

const INVALID_TYPO_TLDS = new Set([
  'con', 'cmo', 'cm', 'coom', 'comm', 'orgg', 'nett', 'eddu', 'gmaill', 'hotmial', 'yaho', 'inf'
]);

const SECOND_LEVEL_TLDS = new Set([
  'co', 'com', 'org', 'net', 'gov', 'edu', 'ac', 'mil', 'gen', 'ind'
]);

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

  // Reject local parts that are 8+ consonants without any vowel or digit
  if (localPart.length >= 8 && !/[aeiouy0-9]/i.test(localPart)) {
    return { isValid: false, message: 'Email username appears invalid. Please enter a valid email address.' };
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

  // Known typo TLDs
  if (INVALID_TYPO_TLDS.has(tld)) {
    return {
      isValid: false,
      message: `Invalid email domain extension ".${tld}". Did you mean ".com" or ".in"?`
    };
  }

  // Check against valid TLD list
  if (!VALID_TLDS.has(tld)) {
    return {
      isValid: false,
      message: `Invalid or unrecognized domain extension ".${tld}". Please provide a valid email (e.g. .com, .in, .org).`
    };
  }

  // Check for common domain typos (e.g. user@gmaill.com)
  const cleanDomain = domainPart.toLowerCase();
  if (COMMON_TYPO_DOMAINS[cleanDomain]) {
    return {
      isValid: false,
      message: `Did you mean "@${COMMON_TYPO_DOMAINS[cleanDomain]}"? Please check your email domain.`
    };
  }

  // Determine the primary domain name label (handling compound extensions like .co.in, .com.au)
  let sldIndex = domainLabels.length - 2;
  if (domainLabels.length >= 3 && SECOND_LEVEL_TLDS.has(domainLabels[sldIndex].toLowerCase())) {
    sldIndex = domainLabels.length - 3;
  }
  const sld = domainLabels[sldIndex].toLowerCase();

  // Reject purely numeric domain name (e.g. user@6263.hhj or user@6263.com)
  if (/^\d+$/.test(sld)) {
    return {
      isValid: false,
      message: `Invalid domain name "${sld}.${tld}". Domain name cannot consist of numbers only.`
    };
  }

  // Reject random consonant cluster / gibberish domain (no vowel or number)
  if (!/[aeiouy0-9]/.test(sld)) {
    return {
      isValid: false,
      message: `Invalid domain name "${sld}.${tld}". Please enter a valid, readable domain name.`
    };
  }

  // Reject 5 or more identical repeating characters (e.g. aaaaa.com)
  if (/(.)\1{4,}/.test(sld)) {
    return {
      isValid: false,
      message: `Invalid domain name "${sld}.${tld}". Domain name contains repeated characters.`
    };
  }

  return { isValid: true, normalizedEmail: raw.toLowerCase(), normalized: raw.toLowerCase() };
};
