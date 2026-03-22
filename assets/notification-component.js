class NotificationComponent extends HTMLElement {
  constructor() {
    super();

    this.handle = this.dataset.handle;
    this.limit = this.dataset.limit;
    this.timeout = parseInt(`${this.dataset.timeout}000`);
    if (window.outerWidth > 768) {
      if (this.handle != '' && this.handle != undefined) {
        const url = `/collections/${this.handle}/products.json?limit=${this.limit}`;
        this.show(url);
      }
    }
  }
  
  show(url) {
    $.getJSON(url, (json) => {
      let i = 0;
      let j = 0;
      const listProduct = json.products;
      if (listProduct.length > 0 ) {
      	setTimeout(() => {
          const countDown = setInterval(() => {
          	if (window.outerWidth > 768) {
              if (j === 0) {
                const products = listProduct[i];
                const variant = products.variants[0];
                this.classList.remove('hide-popup');
                this.classList.add('show-popup');
                this.querySelector('.ajax-notification__image').innerHTML = `<img src='${theme.Images.getSizedImageUrl(products.images[0].src, '200x')}' alt='${products.title}'/>`;
                this.querySelector('.ajax-notification__product-title').innerHTML =  `<a href='/products/${products.handle}'>${products.title}</a>`;
                if (Math.ceil(variant.price) < Math.ceil(variant.compare_at_price)) {
                  this.querySelector('.ajax-notification__product-price').classList.add('price--on-sale');
                  this.querySelector('.ajax-notification__product-price').innerHTML = `<s class="price--sale">${theme.Currency.formatMoney(variant.compare_at_price, window.moneyFormat)}</s><span class="price--regular">${theme.Currency.formatMoney(variant.price, window.moneyFormat)}</span>`;
                } else {
                  this.querySelector('.ajax-notification__product-price').classList.remove('price--on-sale');
                  this.querySelector('.ajax-notification__product-price').innerHTML = `<span class="price--regular">${theme.Currency.formatMoney(variant.price, window.moneyFormat)}</span>`;
                }
                i += 1;
                if (i === this.limit || i === listProduct.length) {
                  i = 0;
                }
                j = 1;
              } else if (j === 1) {
                this.classList.remove('show-popup');
                this.classList.add('hide-popup');
                j = 0;
              }
            } else {
              this.classList.remove('show-popup');
              this.classList.add('hide-popup');
            }
          }, this.timeout);
          this.close(countDown);
        }, this.timeout);
      }
    });
  }
  
  close(countDown) {
    this.querySelector('.ajax-notification__close').addEventListener('click', (event) => {
      event.preventDefault();
      this.classList.remove('show-popup');
      this.classList.add('hide-popup');
      this.innerHTML = '';
      clearInterval(countDown);
    });
  }
}

customElements.define('notification-component', NotificationComponent);