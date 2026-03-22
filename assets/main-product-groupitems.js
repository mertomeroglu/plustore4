class ProductGroupItems extends HTMLElement {
  constructor() {
    super();
    
    this.pricesContent = this.querySelector('[data-group-prices]');
    this.priceContent = this.querySelector('[data-group-price]');
    this.compareContent = this.querySelector('[data-group-price-compare]');
    this.qty = this.querySelectorAll('[data-product-group-quantity]');
    this.submit = this.querySelector('[data-group-submit]');
    this.cartDropdown = document.querySelector('cart-dropdown-bubble');
    
    this.querySelectorAll('[data-collection-variant]').forEach(
      (select) => select.addEventListener('change', this.onSelectClick.bind(this))
    );
    
    this.querySelectorAll('[data-product-group-quantity]').forEach(
      (input) => input.addEventListener('change', this.onInputClick.bind(this))
    );
    
    this.submit.addEventListener('click', this.onSubmitGroup.bind(this));
  }

  onSelectClick(event) {
    event.preventDefault();
    
    const option = event.target.querySelectorAll('option')[event.target.selectedIndex];
    const image = option.dataset.variantImage;
    
    const content = event.target.closest('[data-product-group-item]');
    const imageContent = find('[data-product-group-image]', content);
    
    this.updatePrice(option, content);
    this.updateImage(option, content);
    this.updateSumPrice();
  }
  
  onInputClick(event) {
    event.preventDefault();
    
    this.updateSumPrice();
  }
  
  updatePrice(option, content) {
    const price = option.dataset.variantPrice;
    const compare = option.dataset.variantPriceCompare;
    
  	const pricesContent = find('[data-product-group-prices]', content);
    const priceContent = find('[data-product-group-price]', content);
    const compareContent = find('[data-product-group-price-compare]', content);
    
    compare > price ? pricesContent.classList.add('price--on-sale') : pricesContent.classList.remove('price--on-sale');
    priceContent.innerHTML = theme.Currency.formatMoney(price, window.moneyFormat);
    compareContent.innerHTML = theme.Currency.formatMoney(compare, window.moneyFormat);
  }
  
  updateSumPrice() {
    let tampPrice = 0;
    let tampCompare = 0;
    let check = false;
    
  	Array.from(this.qty).forEach(function(element) {
      if (element.value > 0) {
      	const content = element.closest('[data-product-group-item]');
        const option = Array.from(content.querySelectorAll('option')).find((option) => option.selected);
        const price = option.dataset.variantPrice;
        const compare = option.dataset.variantPriceCompare;
        
        tampPrice += price*element.value;
        tampCompare += compare*element.value;
        
        check = true;
      }
    });
    
    tampCompare > tampPrice ? this.pricesContent.classList.add('price--on-sale') : this.pricesContent.classList.remove('price--on-sale');
    check ? this.submit.removeAttribute('disabled') : this.submit.setAttribute('disabled', true);
    this.priceContent.innerHTML = theme.Currency.formatMoney(tampPrice, window.moneyFormat);
    this.compareContent.innerHTML = theme.Currency.formatMoney(tampCompare, window.moneyFormat);
  }
  
  updateImage(option, content) {
    const image = option.dataset.variantImage;
  	const imageContent = find('[data-product-group-image]', content);
    
    if (image != '' && image != 'undefined') {
      imageContent.src = image;
    }
  }
  
  onSubmitGroup(evt) {
      evt.preventDefault();
      if (this.submit.classList.contains('loading')) return;

      this.submit.setAttribute('aria-disabled', true);
      this.submit.classList.add('loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
      let formData = {
        'items': []
      };
      let formQuantity = [];
      let index = 0;
      Array.from(this.qty).forEach(function(element) {
        if (element.value > 0) {
          const content = element.closest('[data-product-group-item]');
          const value = Array.from(content.querySelectorAll('option')).find((option) => option.selected).value;
          console.log(formData);
          formData.items[index] = {
            'id': value,
            'quantity': element.value,
          };
          formQuantity[value] = element.value;
          index ++;
        }
      });
      console.log(formData);
      
      config.body = JSON.stringify({
        ...formData,
        sections: this.cartDropdown.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });
    
      console.log(config.body);
		
      ajaxCart(config, formQuantity, this.submit);
    }
}
customElements.define('product-groupitems', ProductGroupItems);