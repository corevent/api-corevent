/**
 * Normalizes an API base URL by trimming whitespace and removing a trailing slash.
 * @param {string} url
 * @returns {string}
 */
function normalizeApiBaseUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('API base URL must be a non-empty string')
  }

  const trimmed = url.trim().replace(/\/+$/, '')

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    throw new Error('API base URL must start with http:// or https://')
  }

  return trimmed
}

module.exports = normalizeApiBaseUrl
