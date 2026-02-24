// ======= AUTH: session management, roles, guard =======
const SESSION_KEY = 'session';
const SESSION_VERSION = 1;

/**
 * Returns the stored session object or null when absent / corrupt / wrong version.
 */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.user || !s.role) return null;
    if (s.version !== SESSION_VERSION) return null;
    return s;
  } catch(e) {
    return null;
  }
}

function setSession(user, role, allowedFilter) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    version: SESSION_VERSION,
    user, role, allowedFilter: allowedFilter || null, loginAt: Date.now()
  }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isAuthed() {
  return getSession() !== null;
}

function getRole() {
  const s = getSession();
  return s ? s.role : '';
}

function getAllowedFilter() {
  const s = getSession();
  return s ? s.allowedFilter : null;
}

// Mapper: photographer login (Latin uppercase) → filter key
const ROLE_TO_FILTER = {
  'P1': 'p1',
  'P2': 'p2',
  'P3': 'p3',
  'K1': 'k1',
  'V':  'v',
  'S1': 's1',
  'S2': 's2',
  'Р1': 'p1',
  'Р2': 'p2',
  'Р3': 'p3',
  'К1': 'k1',
  'В':  'v',
  'С1': 's1',
  'С2': 's2',
};

function normalizeLoginValue(v) {
  return (v || '').trim().toUpperCase();
}

/**
 * Returns the filter key for a photographer login, or null if not recognised.
 * @param {string} normalizedLogin - Uppercase Latin login (e.g. 'P1', 'K1', 'V').
 * @returns {string|null}
 */
function getPhotographerFilter(normalizedLogin) {
  return ROLE_TO_FILTER[normalizedLogin] || null;
}
