class CartDropdown extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-dropdown-bubble-product');
	this.modal = document.getElementById('cart-modal');
    this.content = this.querySelector('.cart__dropdown-content');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);
    
    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.actionRemove();
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener('transitionend', () => {
      this.notification.focus();
      trapFocus(this.notification);
    }, { once: true });

    document.body.addEventListener('click', this.onBodyClick);
  }
  
  actionRemove() {
  	this.querySelectorAll('[data-cart-dropdown-remove]').forEach((remove) =>
      remove.addEventListener('click', this.remove.bind(this))
    );
  }
  
  remove(evt) {
    evt.preventDefault();
    
    const target = evt.target;
    this.iconRemove = target.closest('[data-cart-dropdown-remove]');
    this.itemProduct = target.closest('.cart__dropdown-item');
    this.itemProduct.classList.add('is-remove');
    const line = parseInt(this.iconRemove .dataset.cartDropdownRemove);
    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    const formData = {
      'line': line,
      'quantity': 0,
    };
    
    config.body = JSON.stringify({
      ...formData,
      sections: this.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });
    this.updateQuantity(config);
  }
  
  renderError(error) {
  	this.modal.classList.add('is-error');
    this.modal.querySelector('.cart-modal__title-error-message').innerHTML = error;
  }

  close() {
    this.notification.classList.remove('active');

    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    this.modal.classList.remove('is-error');
	this.modal.querySelector('.cart-modal__title-error-message').innerHTML = '';
    this.getSectionsToRender().forEach((section => {
      document.querySelectorAll(section.content).forEach((content) => {
        if (section.content == '[data-cart-modal-product]') {
          content.innerHTML = '';
          parsedState.items.forEach((item) => {
            $(this.getSectionInnerHTML(parsedState.sections[section.id], `#cart-modal-data-product-${item.id}`)).appendTo($(content));
            find(`#cart-modal-product__qty-${item.id}`, content).innerHTML = parsedState.quantityItem[item.id];
          });
        } else {
          content.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        }
      });
    }));

    this.header?.reveal();
    this.content.classList.remove('is-empty');
    this.open();
    this.actionRemove();
  }
    
  renderUpdate(parsedState) {
    this.getSectionsToRender().forEach((section => {
      document.querySelectorAll(section.content).forEach((content) => {
        if (section.content != '[data-cart-modal-product]' && section.content != '[data-cart-modal-count]') {
          content.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        }
      });
    }));
    this.actionRemove();
    if (parsedState.item_count == 0) {
  	  this.content.classList.add('is-empty');
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-dropdown-bubble-product',
        content: '[data-cart-dropdown-bubble-product]'
      },
      {
        id: 'cart-icon-bubble',
        content: '[data-cart-icon-bubble]'
      },
      {
        id: 'cart-modal-data',
        content: '[data-cart-modal-total]',
        selector: '#cart-modal-data-total',
      },
      {
        id: 'cart-modal-data',
        content: '[data-cart-modal-count]',
        selector: '#cart-modal-data-count',
      },
      {
        id: 'cart-modal-data',
        content: '[data-cart-modal-product]'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
        
  updateQuantity(config) {
    fetch(`${routes.cart_change_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          console.error(response.description);
          return;
        }
        this.renderUpdate(response);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
		this.itemProduct.classList.remove('is-remove');
      });
  }      
}

customElements.define('cart-dropdown-bubble', CartDropdown);
