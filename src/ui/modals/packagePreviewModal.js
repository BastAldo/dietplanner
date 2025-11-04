import { fetchAndMergePackage } from '../../api/configService.js';
import { log } from '../../utils/logger.js';

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    log('PackagePreview', 'Failed to fetch JSON', { url, e });
    return null;
  }
}

function renderPreviewList(title, items, key) {
  if (!items || items.length === 0) return '';
  return `
    <div class="preview-section">
      <h4>${title} (${items.length})</h4>
      <ul class="preview-list">
        ${items.map(item => `<li>${item[key]}</li>`).join('')}
      </ul>
    </div>
  `;
}

export async function openPackagePreviewModal(packageManifest) {
  log('Modals', 'Opening package preview modal', { packageManifest });
  const modal = document.getElementById('package-preview-modal');
  const titleEl = modal.querySelector('#package-preview-title');
  const bodyEl = modal.querySelector('#package-preview-body');
  const installBtn = modal.querySelector('#package-preview-install-btn');

  titleEl.textContent = `Anteprima: ${packageManifest.title}`;
  bodyEl.innerHTML = '<p class="placeholder-text">Caricamento contenuti...</p>';
  modal.classList.remove('modal-hidden');

  // Setup install button
  installBtn.dataset.url = packageManifest.url;
  installBtn.onclick = (e) => {
    fetchAndMergePackage(e.currentTarget.dataset.url);
    modal.classList.add('modal-hidden');
  };

  // Fetch content
  const [ingredientsData, mealsData, exercisesData] = await Promise.all([
    packageManifest.ingredientiUrl ? fetchJson(new URL(packageManifest.ingredientiUrl, packageManifest.url).href) : Promise.resolve(null),
    packageManifest.pastiUrl ? fetchJson(new URL(packageManifest.pastiUrl, packageManifest.url).href) : Promise.resolve(null),
    packageManifest.eserciziUrl ? fetchJson(new URL(packageManifest.eserciziUrl, packageManifest.url).href) : Promise.resolve(null)
  ]);

  const ingredients = ingredientsData?.ingredienti || [];
  const meals = mealsData?.meals || [];
  const exercises = exercisesData?.esercizi || [];

  // Render content
  let html = '';
  html += renderPreviewList('Pasti', meals, 'nomePasto');
  html += renderPreviewList('Ingredienti', ingredients, 'nome');
  html += renderPreviewList('Esercizi', exercises, 'name');

  if (html === '') {
    bodyEl.innerHTML = '<p class="placeholder-text">Questo pacchetto non contiene elementi visualizzabili.</p>';
  } else {
    bodyEl.innerHTML = html;
  }
}
