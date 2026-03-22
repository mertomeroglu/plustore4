class PageWishlist extends HTMLElement {
  constructor() {
    super();
    
    this.content = this.querySelector('[page-wishlist-product]');
    this.textRemove = this.content.dataset.remove;
    
    const session = localStorage.getItem('wishlist-storage');
    if (session !== null && session !== '[]' && session !== '[null]') {
      this.show(session);
    } else {
      this.classList.add('is-empty');
    }
  }
  
  show(session) {
    const products = JSON.parse(session);
    this.content.classList.add('is-loading');
    this.showContent(products);
  }
  
  remove() {
    this.querySelectorAll('[data-wishlist-handle]').forEach(
      (action) => {
        action.title = this.textRemove;
        action.addEventListener('click', this.onButtonClick.bind(this));
      }
    );
  }
  
  onButtonClick(event) {
    event.preventDefault();
    const parent = event.target.closest('.product-item__content');
    parent.classList.add('is-hidden');
    const session = localStorage.getItem('wishlist-storage');
    if (JSON.parse(session).length === 0) {
      this.classList.add('is-empty');
    }
  }

  async showContent(products) {
    for (const i in products) {
      const url = `/products/${products[i]}?view=item`;
      await $.get(url, (html) => {
        $(`<div class="col product-item__content product-item__content-${i}"></div>`).appendTo($(this.content));
        const innerHTML = find(`.product-item__content-${i}`, this.content);
        $(html).appendTo($(innerHTML));
        if (i == products.length - 1) {
          this.content.classList.remove('is-loading');
          this.remove();
        }
      }); 
    }
  }
}

customElements.define('page-wishlist', PageWishlist);