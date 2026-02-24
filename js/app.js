// ======= APP: assembly and initialisation =======
// Depends on: auth.js, state.js, ui.js, drawer.js (loaded before this file)

// ======= DOM REFS =======
const loginOverlay   = document.getElementById('loginOverlay');
const appRoot        = document.getElementById('appRoot');
const loginInput     = document.getElementById('loginInput');
const passwordInput  = document.getElementById('passwordInput');
const errorMessage   = document.getElementById('errorMessage');
const loginButton    = document.getElementById('loginButton');

const avatar         = document.getElementById('avatar');
const adminWrapper   = document.getElementById('adminWrapper');
const adminText      = document.getElementById('adminText');
const filterCapsule  = document.getElementById('filterCapsule');
const statusCapsule  = document.getElementById('statusCapsule');
const conditionCapsule = document.getElementById('conditionCapsule');
const searchInput    = document.getElementById('searchInput');
const stickyHeaderEl = document.getElementById('stickyHeader');

// ======= OFFSET LOGIC =======
/**
 * Adjusts the top offset of the car grid so its first row never appears
 * behind the sticky header.
 */
function adjustContentOffset() {
  if (!stickyHeaderEl) return;
  const headerHeight = stickyHeaderEl.offsetHeight;
  document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
  // sticky header is in normal flow in split view; no margin offset needed
}

window.addEventListener('resize', adjustContentOffset);

// ======= LOGOUT MODULE =======
let logoutModule = null;

function createLogoutModule() {
  const module = document.createElement('div');
  module.className = 'logout-module';
  module.textContent = 'Выйти';
  module.id = 'logoutModule';

  module.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSession();
    hideLogoutModule();
    resetUIToDefaults();
    showLogin();
  });

  return module;
}

function showLogoutModule() {
  if (logoutModule) return;
  logoutModule = createLogoutModule();
  adminWrapper.insertBefore(logoutModule, avatar);
}

function hideLogoutModule() {
  if (!logoutModule) return;
  logoutModule.remove();
  logoutModule = null;
}

// ======= LOGIN OVERLAY =======
function removeErrorState() {
  loginInput.classList.remove('error', 'success');
  passwordInput.classList.remove('error', 'success');
  errorMessage.classList.remove('visible');
  loginButton.disabled = false;
}

function showLogin() {
  appRoot.style.display = 'none';
  loginOverlay.classList.add('visible');
  loginOverlay.setAttribute('aria-hidden', 'false');
  removeErrorState();
  setTimeout(() => loginInput.focus(), 0);
}

function hideLogin() {
  loginOverlay.classList.remove('visible');
  loginOverlay.setAttribute('aria-hidden', 'true');
  appRoot.style.display = 'flex';
  removeErrorState();
  loginInput.value = '';
  passwordInput.value = '';
}

// ======= ACCESS CONTROL =======
function applyAccessControl(session) {
  const isAdmin = session && session.role === 'admin';

  avatar.innerHTML = isAdmin
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.219 3.375L8 7.399L4.781 3.375A1.002 1.002 0 0 0 3 4v15c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4a1.002 1.002 0 0 0-1.781-.625L16 7.399l-3.219-4.024c-.381-.474-1.181-.474-1.562 0M5 19v-2h14.001v2zm10.219-9.375c.381.475 1.182.475 1.563 0L19 6.851L19.001 15H5V6.851l2.219 2.774c.381.475 1.182.475 1.563 0L12 5.601z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 8c-2.168 0-4 1.832-4 4s1.832 4 4 4s4-1.832 4-4s-1.832-4-4-4m0 6c-1.065 0-2-.935-2-2s.935-2 2-2s2 .935 2 2s-.935 2-2 2"/><path fill="currentColor" d="M20 5h-2.586l-2.707-2.707A.996.996 0 0 0 14 2h-4a.996.996 0 0 0-.707.293L6.586 5H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2M4 18V7h3c.266 0 .52-.105.707-.293L10.414 4h3.172l2.707 2.707A.996.996 0 0 0 17 7h3l.002 11z"/></svg>`;

  adminText.textContent = isAdmin ? 'ADMIN' : (session ? session.user : '');

  adminWrapper.style.display = '';
  showLogoutModule();

  const buttons = Array.from(document.querySelectorAll('.filter-capsule-btn'));

  if (isAdmin) {
    buttons.forEach(b => { b.disabled = false; });
    return;
  }

  // Photographer: lock to their single filter; logout/profile remain accessible
  const fixedFilter = session ? session.allowedFilter : null;
  activeFilter = fixedFilter;

  buttons.forEach(b => {
    const f = b.dataset.filter;
    const isMine = f === fixedFilter;
    b.classList.toggle('active', isMine);
    b.disabled = !isMine;
  });
}

function resetUIToDefaults() {
  activeFilter = null;
  activeStatus = 'actual';
  activeCondition = 'new';
  searchQuery = '';
  searchInput.value = '';
  document.querySelectorAll('.filter-capsule-btn').forEach(b => { b.classList.remove('active'); b.disabled = false; });
  document.querySelectorAll('.status-capsule-btn').forEach(b => b.classList.toggle('active', b.dataset.status === 'actual'));
  document.querySelectorAll('.condition-capsule-btn').forEach(b => b.classList.toggle('active', b.dataset.condition === 'new'));
  adminWrapper.style.display = '';
}

// ======= FILTER / STATUS / CONDITION / SEARCH HANDLERS =======
document.addEventListener('click', (e) => {
  const linkItem = e.target.closest('.link-item');
  if (linkItem) {
    e.stopPropagation();
    alert(`Переход по ссылке: ${linkItem.textContent}`);
  }
});

const handleFilterClick = (e) => {
  if (getRole() && getRole() !== 'admin') return;

  const btn = e.target.closest('.filter-capsule-btn');
  if (!btn) return;

  const filter = btn.dataset.filter;
  document.querySelectorAll('.filter-capsule-btn').forEach(b => b.classList.remove('active'));

  if (activeFilter === filter) {
    activeFilter = null;
  } else {
    activeFilter = filter;
    btn.classList.add('active');
  }
  renderCars();
};

const handleStatusClick = (e) => {
  const btn = e.target.closest('.status-capsule-btn');
  if (!btn) return;

  const status = btn.dataset.status;
  document.querySelectorAll('.status-capsule-btn').forEach(b => b.classList.remove('active'));

  activeStatus = status;
  btn.classList.add('active');
  renderCars();
};

const handleConditionClick = (e) => {
  const btn = e.target.closest('.condition-capsule-btn');
  if (!btn) return;

  const condition = btn.dataset.condition;
  document.querySelectorAll('.condition-capsule-btn').forEach(b => b.classList.remove('active'));

  activeCondition = condition;
  btn.classList.add('active');
  renderCars();
};

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderCars();
});

let lastSelectedVin = localStorage.getItem('lastSelectedVin') || null;

const handleCarClick = (e) => {
  if (e.target.closest('.link-item')) return;
  const card = e.target.closest('.car-card');
  if (!card) return;
  const vin = card.dataset.vin || null;
  if (vin) {
    lastSelectedVin = vin;
    localStorage.setItem('lastSelectedVin', vin);
  }
  expandRightPane();
  openDrawer();
};

filterCapsule.addEventListener('click', handleFilterClick);
statusCapsule.addEventListener('click', handleStatusClick);
conditionCapsule.addEventListener('click', handleConditionClick);
carsGrid.addEventListener('click', handleCarClick);

// ======= FULLSCREEN PHOTO VIEWER =======
const photoOverlay = document.getElementById('photoViewerOverlay');
const photoImgEl   = document.getElementById('photoViewerImg');

function openPhotoViewer(src) {
  if (!photoOverlay || !photoImgEl) return;
  photoImgEl.src = src;
  photoOverlay.classList.add('open');
  photoOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closePhotoViewer() {
  if (!photoOverlay || !photoImgEl) return;
  photoOverlay.classList.remove('open');
  photoOverlay.setAttribute('aria-hidden', 'true');
  photoImgEl.src = '';
  document.body.style.overflow = '';
}
if (photoOverlay) {
  photoOverlay.addEventListener('click', closePhotoViewer);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && photoOverlay && photoOverlay.classList.contains('open')) {
    closePhotoViewer();
  }
});
window.addEventListener('message', (e) => {
  try {
    if (e.data && e.data.type === 'photo_open' && e.data.src) {
      openPhotoViewer(e.data.src);
    }
  } catch(err) {}
});

// ======= LOGIN HANDLERS =======
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const login    = loginInput.value.trim();
  const password = passwordInput.value.trim();

  removeErrorState();

  if (password === '123') {
    const normLogin         = normalizeLoginValue(login);
    const isAdminLogin      = normLogin === 'ADMIN';
    const photographerFilter = getPhotographerFilter(normLogin);

    if (isAdminLogin || photographerFilter) {
      setSession(login, isAdminLogin ? 'admin' : 'photographer', isAdminLogin ? null : photographerFilter);

      loginInput.classList.add('success');
      passwordInput.classList.add('success');
      loginButton.disabled = true;

      applyAccessControl(getSession());
      renderCars();

      setTimeout(() => {
        hideLogin();
        adjustContentOffset();
      }, 800);
    } else {
      loginInput.classList.add('error');
      passwordInput.classList.add('error');
      errorMessage.classList.add('visible');
    }
  } else {
    loginInput.classList.add('error');
    passwordInput.classList.add('error');
    errorMessage.classList.add('visible');
  }
});

[loginInput, passwordInput].forEach(el => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginButton.click();
  });
  el.addEventListener('input', removeErrorState);
});

// ======= INIT: guard runs before any UI =======
const _initSession = getSession();
if (!_initSession) {
  showLogin();
} else {
  hideLogin();
  applyAccessControl(_initSession);
  renderCars();
  adjustContentOffset();
}
