class ProductGroupImages extends HTMLElement {
  constructor() {
    super();
    
    this.getData();
    this.show();
    $('[data-product-variant-color]').on('change', (event) => {
      event.preventDefault();
      this.show();
    });
  }
  
  getData() {
    this.handle = this.dataset.handle;
    this.size = this.dataset.size;
    this.position = this.dataset.position;
    this.zoom = this.dataset.zoom;
    this.video = this.dataset.video;
    this.navigation = this.dataset.navigation;
    this.pagination = this.dataset.pagination;
  }

  show() {
    this.classList.add('is-loading');
    const value = Array.from(document.querySelectorAll('[data-product-variant-color]')).find((radio) => radio.checked).value.toLowerCase().trim();
    const url = `/products/${this.handle}?view=media&data=${this.size}-${this.position}-${this.zoom}-${this.video}-${this.navigation}-${this.pagination}`;
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.innerHTML = html.querySelector(`[data-media-color='${value}']`).innerHTML;
        this.classList.remove('is-loading');
      });
  }
}
customElements.define('product-groupimages', ProductGroupImages);