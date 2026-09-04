const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');
const pageContent = document.getElementById('pageContent');
const mainHeader = document.getElementById('mainHeader');

const validPages = [
  'home', 'tools', 'about', 'privacy', 'contact', 'partner', 'register', 'sendcontact'
];

const pageFiles = {
  tools: 'tools.html',
  about: 'about.html',
  privacy: 'privacy.html',
  contact: 'contact.html',
  partner: 'partner.html',
  register: 'register.html',
  sendcontact: 'sendcontact.html'
};

const pageAssets = {
  about: { css: 'assets/styles/about.css', js: 'scripts/about.js' },
  contact: { css: 'assets/styles/contact.css' },
  partner: { css: 'assets/styles/partner.css' },
  sendcontact: { css: 'assets/styles/sendcontact.css' },
  register: { css: 'assets/styles/register.css' }
};

const TOKEN_KEY = 'micianaron_route_tokens';
let routeTokenMap = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || '{}');

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
function mapTokenToPage(token, pageId) { routeTokenMap[token] = pageId; sessionStorage.setItem(TOKEN_KEY, JSON.stringify(routeTokenMap)); }
function getPageFromToken(token) { return routeTokenMap[token] || null; }

hamburgerBtn.addEventListener('click', () => {
  hamburgerBtn.classList.toggle('active');
  navMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  const pageElement = e.target.closest('[data-page]');
  if (pageElement) {
    e.preventDefault();
    const pageId = pageElement.getAttribute('data-page');
    if (validPages.includes(pageId)) navigateToPage(pageId);
  }
});

document.getElementById('pageContent').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (form.id === 'contactForm') handleContactForm(form);
  else if (form.id === 'partnerRegistrationForm') handlePartnerRegistration(form);
});

async function loadPage(pageId) {
  if (!validPages.includes(pageId)) pageId = 'home';

  const container = document.querySelector('.container');
  if (pageId === 'contact' || pageId === 'partner') container.classList.add('full-width');
  else container.classList.remove('full-width');

  if (pageId === 'tools') mainHeader.classList.add('tools-active');
  else mainHeader.classList.remove('tools-active');

  if (pageId === 'home') {
    document.querySelectorAll('main.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
  } else {
    try {
      if (pageAssets[pageId] && (pageId === 'register' || pageId === 'sendcontact')) {
        await loadPageAssets(pageId);
      } else if (pageAssets[pageId]) {
        loadPageAssets(pageId);
      }

      const response = await fetch(pageFiles[pageId]);
      if (!response.ok) throw new Error('Failed to load page');
      const html = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      pageContent.innerHTML = '';
      pageContent.appendChild(tempDiv.firstChild);

      document.querySelectorAll('main.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-page').classList.add('active');

      if (pageId === 'tools' && window.initToolsPage) window.initToolsPage();
      if (pageId === 'about' && window.initAboutPage) window.initAboutPage();
    } catch (error) {
      console.error(error);
      pageContent.innerHTML = '<h1 class="page-title">page unavailable</h1>';
      document.querySelectorAll('main.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-page').classList.add('active');
    }
  }

  document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
  const targetNav = document.getElementById(`nav-${pageId}`);
  if (targetNav) targetNav.classList.add('active');

  hamburgerBtn.classList.remove('active');
  navMenu.classList.remove('active');
}

function loadPageAssets(pageId) {
  const assets = pageAssets[pageId];
  if (!assets) return Promise.resolve();
  const promises = [];
  if (assets.css && !document.getElementById(`page-css-${pageId}`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = assets.css; link.id = `page-css-${pageId}`;
    document.head.appendChild(link);
    promises.push(new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }));
  }
  if (assets.js && !document.getElementById(`page-js-${pageId}`)) {
    const script = document.createElement('script');
    script.src = assets.js; script.id = `page-js-${pageId}`; script.async = false;
    document.body.appendChild(script);
    promises.push(new Promise(resolve => { script.onload = resolve; script.onerror = resolve; }));
  } else if (assets.js && document.getElementById(`page-js-${pageId}`)) {
    if (pageId === 'about' && window.initAboutPage) window.initAboutPage();
  }
  return Promise.all(promises);
}

function navigateToPage(pageId) {
  const token = generateToken();
  mapTokenToPage(token, pageId);
  window.history.pushState({ token, pageId }, '', `${window.location.pathname}?id=${token}`);
  loadPage(pageId);
}

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('id');
  let pageId = 'home';
  if (token && getPageFromToken(token)) pageId = getPageFromToken(token);
  loadPage(pageId);
});

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let token = params.get('id');
  let pageId = 'home';
  if (token && getPageFromToken(token)) pageId = getPageFromToken(token);
  else {
    token = generateToken();
    mapTokenToPage(token, 'home');
    window.history.replaceState({ token, pageId: 'home' }, '', `${window.location.pathname}?id=${token}`);
  }
  loadPage(pageId);
});

function handleContactForm(form) {
  const email = form.querySelector('#contactEmail').value.trim();
  const subject = form.querySelector('#contactSubject').value.trim();
  const message = form.querySelector('#contactMessage').value.trim();
  if (!email || !subject || !message) return alert('Please complete all contact fields.');
  console.log('Contact form submitted:', { email, subject, message });
  alert('Message received!');
}

function handlePartnerRegistration(form) {
  const email = form.querySelector('#partnerEmail').value.trim();
  const company = form.querySelector('#partnerCompany').value.trim();
  const name = form.querySelector('#partnerName').value.trim();
  const password = form.querySelector('#partnerPassword').value;
  const details = form.querySelector('#partnerDetails').value.trim();
  if (!email || !company || !name || !password || !details) return alert('Please complete all registration fields.');
  localStorage.setItem('micianaron_partner_registration', JSON.stringify({ email, company, name, details, registeredAt: new Date().toISOString() }));
  alert('Partner registration received!');
  switchPage('partner');
}

function switchPage(pageId) { navigateToPage(pageId); }
