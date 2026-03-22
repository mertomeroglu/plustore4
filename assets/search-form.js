class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.filterData = [];
    this.form = this.querySelector('form');
    this.content = this.querySelectorAll('[data-search-autocomplete]')[0];
    
    this.form.addEventListener(
      'keyup',
      (event) => event.code.toUpperCase() === 'ESCAPE' && this.close()
    );
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);
    this.form.addEventListener('input', this.debouncedOnSubmit.bind(this));
    this.form.addEventListener('submit', function(event){
      event.preventDefault();
      const formData = new FormData(event.target.closest('form'));
      const searchParams = new URLSearchParams(formData).toString();
      const searchUrl = searchParams.split('&product_type=');
      const searchTerms = searchUrl[0].trim();
      const searchType = searchUrl[1] ? searchUrl[1].trim() : '*';
      
      const url = (searchType === '*') ? `/search?${searchTerms}` : `/search?${searchTerms}+product_type:${searchType}`;
      
      location.href = url;
    });
  }
  onSubmitHandler(event) {
    event.preventDefault();
    if (this.content.dataset.searchAutocomplete === 'true') {
      const formData = new FormData(event.target.closest('form'));
      const searchParams = new URLSearchParams(formData).toString();
      this.renderPage(searchParams, event);
    }
  }
  renderPage(searchParams, event) {
    const searchUrl = searchParams.split('&product_type=');
    const searchTerms = searchUrl[0].trim();
    const searchType = searchUrl[1] ? searchUrl[1].trim() : '*';
    
    const url = (searchType === '*') ? `/search?view=autocomplete&${searchTerms}` : `/search?view=autocomplete&${searchTerms}+product_type:${searchType}`;
    const urlAction = (searchType === '*') ? `/search?${searchTerms}` : `/search?${searchTerms}+product_type:${searchType}`;
    const filterDataUrl = element => element.url === url;
    this.filterData.some(filterDataUrl) ?
      this.renderSectionFromCache(filterDataUrl, event) :
      this.renderSectionFromFetch(url, urlAction, event);
  }
  renderSectionFromFetch(url, urlAction, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
      	const html = new DOMParser().parseFromString(responseText, 'text/html');
        html.querySelectorAll('.search-results__action')[0].href = urlAction;
        this.filterData = [...this.filterData, { html, url }];
      
        this.renderProductGrid(html.querySelectorAll('.search-results__layout')[0]);
      });
  }
  renderSectionFromCache(filterDataUrl, event) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderProductGrid(html.querySelectorAll('.search-results__layout')[0]);
  }
  renderProductGrid(html) {
    this.content.classList.add('is-active');
    this.content.innerHTML = html.innerHTML;
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    document.body.addEventListener('click', this.onBodyClickEvent);
  }
  onBodyClick(event) {
    if (!this.contains(event.target)) this.close();
  }
  close() {
    this.content.classList.remove('is-active');
    document.body.removeEventListener('click', this.onBodyClickEvent);
  }
}
customElements.define('search-form', SearchForm);