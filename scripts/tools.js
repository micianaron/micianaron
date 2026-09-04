let allTools = [];
let filteredTools = [];

function initToolsPage() {
  const toolsPage = document.querySelector('.tools-page');
  if (!toolsPage) return;

  fetchTools();

  const searchInput = document.getElementById('globalToolSearch');
  if (searchInput && !searchInput.dataset.listenerAttached) {
    searchInput.dataset.listenerAttached = 'true';
    searchInput.addEventListener('input', handleSearch);
  }
}

async function fetchTools() {
  try {
    const response = await fetch('../backend/content/tools.json');  // relative from public/
    if (!response.ok) throw new Error('Failed to load tools');
    allTools = await response.json();
    filteredTools = [...allTools];
    renderTools(filteredTools);
  } catch (error) {
    console.error(error);
    const grid = document.getElementById('toolsGrid');
    if (grid) grid.innerHTML = '<div class="tools-empty">Unable to load tools.</div>';
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) filteredTools = [...allTools];
  else filteredTools = allTools.filter(tool =>
    tool.title.toLowerCase().includes(query) ||
    tool.url.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query)
  );
  renderTools(filteredTools);
}

function renderTools(tools) {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  if (tools.length === 0) {
    grid.innerHTML = '<div class="tools-empty">No tools found.</div>';
    return;
  }
  grid.innerHTML = tools.map(createToolCard).join('');
}

function createToolCard(tool) {
  const iconUrl = tool.icon || '../assets/images/dark-logo.png';
  return `
    <a class="tool-card" href="${tool.url}" target="_blank" rel="noopener noreferrer">
      <div class="tool-card-icon">
        <img src="${iconUrl}" alt="${tool.title}" onerror="this.onerror=null; this.src='../assets/images/dark-logo.png'" />
      </div>
      <div class="tool-card-info">
        <span class="tool-card-title">${tool.title}</span>
        <span class="tool-card-url">${tool.url}</span>
        <span class="tool-card-description">${tool.description}</span>
      </div>
    </a>
  `;
}

window.initToolsPage = initToolsPage;
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.tools-page')) initToolsPage();
});