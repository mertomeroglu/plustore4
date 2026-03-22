class ProductRecently extends HTMLElement {
  constructor() {
    super();
    
    this.content = this.querySelector('[data-product-recently]');
    this.slidable = this.dataset.slidable;
    const handle = this.dataset.handle;
    const limit = this.dataset.limit;
    if (this.slidable === 'true') {
      this.slider = this.querySelector('slider-component');
    }
    if (handle !== '' && handle !== undefined) {
      this.add(handle, limit);
      this.show(handle);
    }
  }
  
  add(handle, limit) {
    let data = localStorage.getItem('product-recently');
    if (data !== null && data !== '[]' && data !== '[null]') {
      data = JSON.parse(data);
    } else {
      data = [];
    }
    const index = data.indexOf(handle);
    if (index !== -1) {
      data.splice(index, 1);
    }
    data.push(handle);
    if (data.length > parseInt(limit, 10) + 1) {
      const begin = data.length - (parseInt(limit, 10) + 1);
      data = data.slice(begin);
    }
    localStorage.setItem('product-recently', JSON.stringify(data));
  }
  
  show(handle) {
    const session = localStorage.getItem('product-recently');
    if (session !== null && session !== '[]' && session !== '[null]') {
      const products = JSON.parse(session);
      if (products.length == 1) {
        this.classList.add('hidden');
      }
      this.content.classList.add('is-loading');
      this.showContent(products, handle);
    } 
  }

  async showContent(products, handle) {
    for (const i in products) {
      if (products[i] && products[i] !== handle) {
        const url = `/products/${products[i]}?view=item`;
        await $.get(url, (html) => {
          if (this.slidable === 'true') {
            $(`<div class="swiper-slide col product-item__content product-item__content-${i}" data-carousel-item></div>`).appendTo($(this.content));
          } else {
            $(`<div class="col product-item__content product-item__content-${i}"></div>`).appendTo($(this.content));
          }
          const innerHTML = find(`.product-item__content-${i}`, this.content);
          $(html).appendTo($(innerHTML));
          if (i == products.length - 2) {
          	this.content.classList.remove('is-loading');
            if (this.slidable === 'true') {
              this.slider.init();
            }
          }
        }); 
      }
    }
  }
}

customElements.define('product-recently', ProductRecently);