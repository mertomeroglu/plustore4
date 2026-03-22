class BundleComponent extends HTMLElement {
  constructor() {
    super();
    
    this.price = this.querySelectorAll('[data-bundle-price]')[0];
    this.priceCompare = this.querySelectorAll('[data-bundle-price-compare]')[0];
    this.button = this.querySelectorAll('.bundle-button__price')[0];
	this.checkbox = this.querySelectorAll('[data-bundle-checkbox]');
    if (this.price !== null && this.price !== undefined) {
      this.addEventListener('change', this.onChange);
    }
  }
  
  onChange() {
    let price = parseInt(this.price.dataset.bundlePrice);
    let priceCompare = parseInt(this.priceCompare.dataset.bundlePriceCompare);
    Array.from(this.checkbox).find((checkbox) => {
      const value = checkbox.value;
      if (checkbox.checked) {
        $(`[data-bundle-id="${value}"]`).addClass('active');
        price += parseInt(checkbox.dataset.price);
        priceCompare += parseInt(checkbox.dataset.priceCompare);
      } else {
      	$(`[data-bundle-id="${value}"]`).removeClass('active');
      }
    });
    priceCompare > price ? this.button.classList.add('price--on-sale') : this.button.classList.remove('price--on-sale');
    this.price.innerHTML = theme.Currency.formatMoney(price, window.moneyFormat);
    this.priceCompare.innerHTML = theme.Currency.formatMoney(priceCompare, window.moneyFormat);
  }
}

customElements.define('bundle-component', BundleComponent);

class VariantSelects extends BundleComponent {
  constructor() {
    super();
	this.updateMasterVariants();
	this.price = document.querySelectorAll('[data-bundle-price]')[0];
    this.priceCompare = document.querySelectorAll('[data-bundle-price-compare]')[0];
    this.button = document.querySelectorAll('.bundle-button__price')[0];
	this.checkbox = document.querySelectorAll('[data-bundle-checkbox]');
    this.slider = this.dataset.mediaSlider;
    if (this.slider == 'true') {
      $('[data-variant-image]').val($('[data-variant-image]').val()).change();
    }
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateMasterVariants();
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      if (this.price !== null && this.price !== undefined) {
	    this.updatePriceBundle();
        this.onChange();
      }
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updatePriceBundle() {
	if (!this.currentVariant) return;
	this.price.dataset.bundlePrice = this.currentVariant.price;
	this.currentVariant.compare_at_price !== null ? this.priceCompare.dataset.bundlePriceCompare = this.currentVariant.compare_at_price : this.priceCompare.dataset.bundlePriceCompare = this.currentVariant.price;
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      const type = fieldset.dataset.type;
      if (type === 'input') {
	    const value = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
		fieldset.querySelectorAll('[data-value]')[0].innerHTML = value;
        return value;
      } else {
		const value = Array.from(fieldset.querySelectorAll('option')).find((option) => option.selected).value;
		fieldset.querySelectorAll('[data-value]')[0].innerHTML = value;
        return value;
      }
    });
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    if (this.slider == 'true') {
      $('[data-variant-image]').val(this.currentVariant.featured_media.id).change();
    } else {
      const newMedia = document.querySelector(
        `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
      );

      if (!newMedia) return;
      const parent = newMedia.parentElement;
      if (parent.firstChild == newMedia) return;
      parent.prepend(newMedia);
      window.setTimeout(() => { parent.querySelector('div.product-media__item').scrollIntoView({behavior: "smooth"}); });
    }
  }

  updateURL() {
    if (!this.dataset.url.includes('?view=quick-view')) {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if (text) addButton.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      const variantInventory = JSON.parse(document.querySelector(`[id^="VariantJSON-${this.dataset.section}"]`).textContent)[0];
      if (variantInventory[this.currentVariant.id] <= 0 && this.currentVariant.inventory_management == 'shopify') {
        addButton.textContent = window.variantStrings.preOrder;
      } else {
      	addButton.textContent = window.variantStrings.addToCart;
      }
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButton.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  updateMasterVariants() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    fieldsets.map((fieldset, index) => {
      if (index + 1 == fieldsets.length) return false;
      const nextFieldset = fieldsets[index + 1];
      const indexParent = index;

      const type = nextFieldset.dataset.type;
      if (type === 'input') {
        Array.from(nextFieldset.querySelectorAll('input')).find((radio) => {
          radio.disabled = true;
        });
      } else {
        Array.from(nextFieldset.querySelectorAll('option')).find((option) => {
          option.disabled = true;
        });
      }
      
      this.getVariantData().find((variant, index) => {
        const options = variant.options;
        let prevOptionId = 0;
        const prevType = fieldsets[prevOptionId].dataset.type;
        while (prevOptionId <= indexParent ) {
          if (prevType === 'input') {
            if ($('input:checked', fieldsets[prevOptionId]).val() !== options[prevOptionId]) {
              break;
            }
            if ($('input:checked', fieldsets[prevOptionId]).val() === options[prevOptionId] && prevOptionId === indexParent) { 
              $(nextFieldset).find(`[value="${options[indexParent + 1]}"]`).removeAttr('disabled');
            }
          } else {
          	if ($('option:selected', fieldsets[prevOptionId]).val() !== options[prevOptionId]) {
              break;
            }
            if ($('option:selected', fieldsets[prevOptionId]).val() === options[prevOptionId] && prevOptionId === indexParent) {
              $(nextFieldset).find(`[value="${options[indexParent + 1]}"]`).removeAttr('disabled');
            }
          }
          prevOptionId++;
        }
      });
      
      if (type === 'input') {
        if (Array.from(nextFieldset.querySelectorAll('input')).find((radio) => radio.checked).disabled) {
          $('input:enabled', nextFieldset).eq(0).prop('checked', true).change();
        }
      } else {
        if (Array.from(nextFieldset.querySelectorAll('option')).find((option) => option.selected).disabled) {
          $('select', nextFieldset).val($('option:enabled', nextFieldset).eq(0).attr('value')).change();
        }
      }
    });
  }
}

customElements.define('variant-selects', VariantSelects);

class TermsConditions extends HTMLElement {
  constructor() {
    super();
    
    this.checkbox = this.querySelector('input');
    this.addEventListener('change', this.onChange);
  }
  
  onChange() {
    const value = this.checkbox.value;
    const checkout = document.getElementById(`product-checkout-${value}`);
    this.checkbox.checked ? checkout.classList.remove('product-checkout__disabled') : checkout.classList.add('product-checkout__disabled');
  }
}

customElements.define('terms-conditions', TermsConditions);

class pswpElement {
  constructor() {
    this.items = [];
    document.querySelectorAll('.product-item__image-zoom').forEach((image, index) => {
      this.items[index] = {
        src: image.dataset.src,
        w: parseInt(image.dataset.width, 10),
        h: parseInt(image.dataset.height, 10)
      };
    });
    if (this.items.length !== 0) {
      this.gallery();
    }  
  }
  
  gallery() {
    const pswpElement = document.querySelectorAll('.pswp')[0];
    const initializeGallery = (i) => {
      const getindex = parseInt(i, 10);
      const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, this.items, {
        index: getindex,
        preload: [1, 3],
        closeOnScroll: false,
        closeOnVerticalDrag: false,
        shareEl: false,
        history: false,
      });
      gallery.init();
    };
    $('.product-item__image-zoom').click((event) => {
      const $this = $(event.currentTarget);
      const getindex = $this.data('index');
      initializeGallery(getindex);
    });
  }
}

new pswpElement();

class gotoReview {
  constructor() {
    document.querySelectorAll('[data-review-anchor]').forEach(
      (action) => action.addEventListener('click', this.onActionClick.bind(this))
    );
  }

  onActionClick(event) {
    event.preventDefault();
    
    const target = attr(event.currentTarget, 'href').slice(1);
    window.setTimeout(() => { document.getElementById(target).scrollIntoView({behavior: "smooth", block: "start"}); });
  }
}

new gotoReview();