/**
 * CSRF Token Helper for Frontend
 *
 * Reads the CSRF token from cookies and adds it to API requests
 */

/**
 * Get CSRF token from cookies
 */
export function getCsrfToken(): string | null {
  const name = 'csrf-token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

/**
 * Get CSRF headers for API requests
 * Use this with axios or fetch
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (token) {
    return {
      'x-csrf-token': token,
    };
  }
  return {};
}

export default getCsrfHeaders;
