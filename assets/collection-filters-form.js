class GridListComponent extends HTMLElement {
  constructor() {
    super();
    const $this = this;
    this.item = this.querySelectorAll('[data-collection-grid-list]');
    this.debouncedOnSubmit = debounce((event) => {
      document.getElementById('CollectionProductGrid').querySelector('.collection').classList.add('loading');
      this.loadGridList(event);
    }, 0);
    
    Array.from(this.item).forEach(function(element) {
      element.addEventListener('click', $this.debouncedOnSubmit.bind($this));
    });
  }
  
  loadGridList(event) {
    event.preventDefault();
    const item = event.target.closest('[data-collection-grid-list]');
    const data = item.dataset.collectionGridList;
    if (data === 'list') {
      this.querySelectorAll('[data-collection-grid-list]')[0].classList.remove('active');
      document.getElementById('main-collection-product-grid').classList.add('collection-template__product-list');
      document.getElementById('main-collection-product-grid').classList.remove('collection-template__product-grid');
    } else {
      this.querySelectorAll('[data-collection-grid-list]')[1].classList.remove('active');
      document.getElementById('main-collection-product-grid').classList.add('collection-template__product-grid');
      document.getElementById('main-collection-product-grid').classList.remove('collection-template__product-list');
    }
    item.classList.add('active');
    document.getElementById('CollectionProductGrid').querySelector('.collection').classList.remove('loading');
  }
}

customElements.define('grid-list-component', GridListComponent);

class CollectionFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.filterData = [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    window.addEventListener('popstate', this.onHistoryChange.bind(this));
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    this.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    this.toggleActiveFacets();
    this.renderPage(new URL(event.currentTarget.href).searchParams.toString());
  }

  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || '';
    this.renderPage(searchParams, null, false);
  }

  toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  renderPage(searchParams, event, updateURLHash = true) {
    const sections = this.getSections();
    document.getElementById('CollectionProductGrid').querySelector('.collection').classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      this.filterData.some(filterDataUrl) ?
        this.renderSectionFromCache(filterDataUrl, event) :
        this.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) this.updateURLHash(searchParams);
  }

  renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, { html, url }];
        this.renderFilters(html, event);
        this.renderProductGrid(html);
      });
  }

  renderSectionFromCache(filterDataUrl, event) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderFilters(html, event);
    this.renderProductGrid(html);
  }

  renderProductGrid(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('CollectionProductGrid').innerHTML;

    document.getElementById('CollectionProductGrid').innerHTML = innerHTML;
    if (window.SPR) {
      var t = $('[src*="productreviews.shopifycdn.com"]');
      t.replaceWith($("<script>").attr("src", t.attr("src"))).remove()
    }
  }

  renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#CollectionFiltersForm .js-filter, #CollectionFiltersFormMobile .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target.closest('.js-filter')?.dataset.index
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    this.renderActiveFacets(parsedHTML);
    this.renderAdditionalElements(parsedHTML);

    if (countsToRender) this.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
	  if (!activeFacetsElement) return;
	  activeFacetsElement.querySelectorAll('facet-remove').length <= 1 ? document.querySelector(selector).classList.add('is-empty') : document.querySelector(selector).classList.remove('is-empty');
	  document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    this.toggleActiveFacets(false);
  }

  renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
	  if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('CollectionFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  renderCounts(source, target) {
    const countElementSelectors = ['.count-bubble','.facets__selected'];
    countElementSelectors.forEach((selector) => {
      const targetElement = target.querySelector(selector);
      const sourceElement = source.querySelector(selector);

      if (sourceElement && targetElement) {
        target.querySelector(selector).outerHTML = source.querySelector(selector).outerHTML;
      }
    });
  }

  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  getSections() {
    return [
      {
        id: 'main-collection-product-grid',
        section: document.getElementById('main-collection-product-grid').dataset.id,
      }
    ]
  }
}

customElements.define('collection-filters-form', CollectionFiltersForm);

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input[type="number"]')
      .forEach(element => element.addEventListener('change', this.onInputChange.bind(this)));

	this.querySelectorAll('input[type="range"]')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxInputValues();
 	
  }

  onInputChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxInputValues();
  }

  onRangeChange(event) {
    this.setMinAndMaxRangeValues();
  }

  setMinAndMaxInputValues() {
    const inputs = this.querySelectorAll('input[type="number"]');
    const minInput = inputs[0];
    const maxInput = inputs[1];
	const ranges = this.querySelectorAll('input[type="range"]');
	let minRange = ranges[0];
    let maxRange = ranges[1];
	if (parseInt(maxRange.value) < parseInt(minRange.value)) {
      minRange = ranges[1];
      maxRange = ranges[0];
    }
	if (maxInput.value) {
	  maxRange.value = maxInput.value;
	  minInput.setAttribute('max', maxInput.value);
	}
    if (minInput.value) {
	  minRange.value = minInput.value;
      maxInput.setAttribute('min', minInput.value);
    }
    if (minInput.value === '') {
      maxInput.setAttribute('min', 0);
    }
    if (maxInput.value === '') {
      minInput.setAttribute('max', maxInput.getAttribute('max'));
    }
  }

  setMinAndMaxRangeValues() {
    const inputs = this.querySelectorAll('input[type="number"]');
    const minInput = inputs[0];
    const maxInput = inputs[1];
	const ranges = this.querySelectorAll('input[type="range"]');
	let minRange = ranges[0];
    let maxRange = ranges[1];
	if (parseInt(maxRange.value) < parseInt(minRange.value)) {
      minRange = ranges[1];
      maxRange = ranges[0];
    }
	if (maxRange.value) {
	  maxInput.value = maxRange.value;
	  minInput.setAttribute('max', maxInput.value);
	}
    if (minRange.value) {
	  minInput.value = minRange.value;
      maxInput.setAttribute('min', minInput.value);
    }
    if (minInput.value === '') {
      maxInput.setAttribute('min', 0);
    }
    if (maxInput.value === '') {
      minInput.setAttribute('max', maxInput.getAttribute('max'));
    }
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('collection-filters-form') || document.querySelector('collection-filters-form');
      form.onActiveFilterClick(event);
    });
  }
}

customElements.define('facet-remove', FacetRemove);
