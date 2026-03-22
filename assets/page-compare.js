class PageCompare extends HTMLElement {
  constructor() {
    super();
    
    this.content = this.querySelector('[page-compare-product]');
    this.textRemove = this.content.dataset.remove;
    const session = localStorage.getItem('compare-storage');
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
    this.querySelectorAll('[data-compare-handle]').forEach(
      (action) => {
        action.title = this.textRemove;
        action.addEventListener('click', this.onButtonClick.bind(this));
      }
    );
  }
  
  onButtonClick(event) {
    event.preventDefault();
    const handle = event.target.closest('[data-compare-handle]').dataset.compareHandle;
    $(`[data-page-compare-handle="${handle}"]`).hide(300);
    const session = localStorage.getItem('compare-storage');
    if (JSON.parse(session).length === 0) {
      this.classList.add('is-empty');
    }
  }

  async showContent(products) {
    for (const i in products) {
      const url = `/products/${products[i]}?view=compare`;
      await $.get(url, (html) => {
        const $product = $('<div/>').html(html);
        $('td', $product).each((index, element) => {
          $(element).appendTo($(`tr[data-type="${$(element).data('type')}"]`, this.content));
        });
        if (i == products.length - 1) {
          this.content.classList.remove('is-loading');
          this.remove();
        }
      }); 
    }
  }
}

customElements.define('page-compare', PageCompare);