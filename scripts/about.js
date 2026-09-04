let blogPosts = [];

function initAboutPage() {
  const blogGrid = document.getElementById('blogGrid');
  if (blogGrid && !blogGrid.dataset.initialized) {
    blogGrid.dataset.initialized = 'true';
    fetchBlogPosts();
  }
}

async function fetchBlogPosts() {
  try {
    const response = await fetch('backend/content/blog.json');
    if (!response.ok) throw new Error('Failed to load blog');
    blogPosts = await response.json();
    renderBlogCards(blogPosts);
  } catch (error) {
    console.error(error);
    document.getElementById('blogGrid').innerHTML = '<div class="tools-empty">Unable to load blog posts.</div>';
  }
}

function renderBlogCards(posts) {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  grid.innerHTML = posts.map(post => createBlogCard(post)).join('');
}

function createBlogCard(post) {
  const imageSrc = post.image || 'assets/images/dark-logo.png';
  return `
    <a class="blog-card" href="${post.url}" target="_blank" rel="noopener noreferrer">
      <div class="blog-card-image-wrapper"><img src="${imageSrc}" alt="${post.title}" onerror="this.onerror=null; this.src='assets/images/dark-logo.png'" /></div>
      <div class="blog-card-content"><span class="blog-card-title">${post.title}</span></div>
    </a>`;
}

window.initAboutPage = initAboutPage;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blogGrid')) initAboutPage();
});
