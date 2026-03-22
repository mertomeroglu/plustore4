class ProductQuickView extends HTMLElement {
  constructor() {
    super();
    this.quickData = [];
    this.content = document.getElementById('product-quickview');
    this.action = this.querySelector('a');
	this.action.addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick(event) {
    event.preventDefault();
    this.action.classList.add('loading');
    const handle = this.action.dataset.handle;
    const quickDataUrl = element => element.handle === handle;
    this.quickData.some(quickDataUrl) ?
      this.renderSectionFromCache(quickDataUrl, event) :
      this.renderSectionFromFetch(handle, event);
  }

  renderSectionFromCache(quickDataUrl, event) {
    const html = this.quickData.find(quickDataUrl).html;
    this.renderProductGrid(html.querySelector('.main-product-quick-view'));
  }
  
  renderSectionFromFetch(handle, event) {
    const url = `/products/${handle}?view=quick-view`;
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.quickData = [...this.quickData, { html, handle }];
        this.renderProductGrid(html.querySelector('.main-product-quick-view'));
      });
  }
  renderProductGrid(html) {
    this.content.querySelector('.product-quickview-modal__content').innerHTML = html.innerHTML;
    if (window.SPR) {
      var t = $('[src*="productreviews.shopifycdn.com"]');
      t.replaceWith($("<script>").attr("src", t.attr("src"))).remove()
    }
    this.action.classList.remove('loading');
    document.body.classList.add('modal-loading');
    this.content.classList.add('modal-open');
    
    window.onkeyup = (event) => {
      if(!event.code) return;
      if(event.code.toUpperCase() === 'ESCAPE') this.closeModal(event);
    }
    
    this.content.querySelectorAll('[data-modal-close]').forEach(
      (button) => button.addEventListener('click', this.closeModal.bind(this))
    );
  }
    
  closeModal(event) {
    event.preventDefault();
    document.body.classList.remove('modal-loading');
    this.content.classList.remove('modal-open');
  }
}

customElements.define('product-quickview', ProductQuickView);