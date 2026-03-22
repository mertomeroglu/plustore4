if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartDropdown = document.querySelector('cart-dropdown-bubble');
      this.bundle = document.querySelector('bundle-component');
      if (this.bundle !== null) {
        this.bundle.querySelector('[type="button"]').addEventListener('click', this.onSubmitBundle.bind(this));
      }
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      this.submitButton = this.querySelector('[type="submit"]');
      if (this.submitButton.classList.contains('loading')) return;

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      this.formData = {
        'items': [
          JSON.parse(serializeForm(this.form))
         ]
      };
      
      this.formQuantity = [];
      this.formQuantity[JSON.parse(serializeForm(this.form)).id] = JSON.parse(serializeForm(this.form)).quantity;
      
      config.body = JSON.stringify({
        ...this.formData,
        sections: this.cartDropdown.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });
		
      ajaxCart(config, this.formQuantity, this.submitButton);
    }
  
  	onSubmitBundle(evt) {
      evt.preventDefault();
      this.bundleButton = this.bundle.querySelector('[type="button"]');
      if (this.bundleButton.classList.contains('loading')) return;

      this.bundleButton.setAttribute('aria-disabled', true);
      this.bundleButton.classList.add('loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      const listCheckbox = this.bundle.querySelectorAll('[data-bundle-checkbox]:checked');
      this.formData = {
        'items': [
          JSON.parse(serializeForm(this.form))
         ]
      };
      
      this.formQuantity = [];
      this.formQuantity[JSON.parse(serializeForm(this.form)).id] = JSON.parse(serializeForm(this.form)).quantity;
      Array.from(listCheckbox).find((checkbox, index) => {
        this.formData.items[index + 1] = {
          'id': checkbox.value,
          'quantity': 1,
        };
		this.formQuantity[checkbox.value] = 1;
      }); 
      
      config.body = JSON.stringify({
        ...this.formData,
        sections: this.cartDropdown.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });
		
      ajaxCart(config, this.formQuantity, this.bundleButton);
    }
  });
}