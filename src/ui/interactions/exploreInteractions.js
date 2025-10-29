import { getState, setUiState } from '../../core/state.js';
import { log } from '../../utils/logger.js';

function handleSearchInput(e) {
  const searchTerm = e.target.value;
  const currentState = getState();
  setUiState({
    ...currentState.ui,
    explore: {
      ...currentState.ui.explore,
      searchTerm: searchTerm
    }
  });
}

function handleSortChange(e) {
  const sortOrder = e.target.value;
  const currentState = getState();
  setUiState({
    ...currentState.ui,
    explore: {
      ...currentState.ui.explore,
      sortOrder: sortOrder
    }
  });
}

function handleTagClick(e) {
  const tag = e.target.dataset.tag;
  if (!tag) return;

  const currentState = getState();
  const { activeTags } = currentState.ui.explore;
  let newActiveTags;

  if (tag === 'all') {
    newActiveTags = [];
  } else {
    if (activeTags.includes(tag)) {
      newActiveTags = activeTags.filter(t => t !== tag);
    } else {
      newActiveTags = [...activeTags, tag];
    }
  }

  setUiState({
    ...currentState.ui,
    explore: {
      ...currentState.ui.explore,
      activeTags: newActiveTags
    }
  });
}

export function initializeExploreListeners() {
  log('Interactions', 'Initializing explore listeners');
  const explorePage = document.getElementById('explore-page');
  if (explorePage) {
    const searchInput = document.getElementById('explore-search-input');
    searchInput.addEventListener('input', handleSearchInput);

    const sortSelect = document.getElementById('explore-sort-select');
    sortSelect.addEventListener('change', handleSortChange);

    const tagsContainer = document.getElementById('explore-tags-container');
    tagsContainer.addEventListener('click', handleTagClick);
  }
}
