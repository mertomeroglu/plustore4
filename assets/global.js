function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

theme.Currency = (function() {
  var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormat;

    function formatWithDelimiters(number, precision, thousands, decimal) {
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number === null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      );
      var centsAmount = parts[1] ? decimal + parts[1] : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, "'");
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

theme.Images = (function() {
  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(
      /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\\.@]/
    );

    if (match !== null) {
      if (match[2] !== undefined) {
        return match[1] + match[2];
      } else {
        return match[1];
      }
    } else {
      return null;
    }
  }

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(
      /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i
    );

    if (match !== null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => model.modelViewerUI?.pause());
}
                                                     
function playAllMedia($this) {
  $this.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
  });
  $this.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"play"}', '*');
  });
  $this.querySelectorAll('video').forEach((video) => video.play());
  $this.querySelectorAll('product-model').forEach((model) => model.modelViewerUI?.play());
}                                                     

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function ajaxCart(config, formQuantity, button) {
  const cartDropdown = document.querySelector('cart-dropdown-bubble');
  
  fetch(`${routes.cart_add_url}`, config)
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        cartDropdown.renderError(response.description);
        return;
      }
      response['quantityItem'] = formQuantity;
      cartDropdown.renderContents(response);
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      button.classList.remove('loading');
      button.removeAttribute('aria-disabled');
      if (window.cartAjax) {
        openCartModal();
      } else {
        window.location.href = window.routes.cart_url;
      }
    });
}

function openCartModal() {
  const cartModal = document.querySelector('cart-modal');
  document.body.classList.add('modal-loading');
  cartModal.classList.add('modal-open');
  const countdown = cartModal.querySelector('[data-cart-modal-countdown]');
  const timerEvt = countdown.querySelector('[data-cart-modal-countdown]');
  let timer = parseInt(countdown.dataset.cartModalCountdown);
  const countDown = setInterval(() => {
    timer --;                           
    timerEvt.innerHTML = timer;
    if (timer < 0) {
      document.body.classList.remove('modal-loading');
      cartModal.classList.remove('modal-open');
      clearInterval(countDown);
      timerEvt.innerHTML = parseInt(countdown.dataset.cartModalCountdown);
    }
  }, 1000);

  this.closeCartModal = (event) => {
    event.preventDefault();
	cartModal.classList.remove('modal-open');
    document.body.classList.remove('modal-loading');
    clearInterval(countDown);
    timerEvt.innerHTML = timer;
  }

  window.onkeyup = (event) => {
    if(!event.code) return;
    if(event.code.toUpperCase() === 'ESCAPE') this.closeCartModal(event)
  }
  cartModal.querySelectorAll('[data-modal-close]').forEach(
    (button) => button.addEventListener('click', this.closeCartModal.bind(this))
  );
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    const summaryElements = this.querySelectorAll('summary');
    this.addAccessibilityAttributes(summaryElements);

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach(element => {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-expanded', false);
      element.setAttribute('aria-controls', element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));

      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-theme-header');
    this.borderOffset = this.borderOffset || this.closest('.main-header').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
    });
    this.addEventListener('keyup', () => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    this.querySelector('.template-popup')?.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');
    button?.addEventListener('click', () => {
      document.querySelector(this.getAttribute('data-modal'))?.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent() {
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      window.pauseAllMedia();
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);
    
class ModalComponent extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[data-modal]').addEventListener('click', this.openModal.bind(this));
  }
    
  openModal(event) {
    event.preventDefault();
    document.body.classList.add('modal-loading');
    const action = event.target.closest('[data-modal]');
    this.content = document.getElementById(action.dataset.modal);
    this.content.classList.add('modal-open');
    
    window.onkeyup = (event) => {
      if(event.code.toUpperCase() === 'ESCAPE') this.closeModal(event)
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

customElements.define('modal-component', ModalComponent);    
    
const Accordion = function(el, multiple) {
    this.el = el || {};
    this.multiple = multiple || false;
    const links = this.el.find('.accordion__title');
    links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
}

Accordion.prototype.dropdown = function(e) {
  const $el = e.data.el;
  $this = $(this),
  $next = $this.next();

  $next.slideToggle();
  $this.parent().toggleClass('open');

  if (!e.data.multiple) {
    $el.find('.accordion__content').not($next).slideUp().parent().removeClass('open');
  };
}	
    
class AccordionComponent extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const parent = this.dataset.accordionParent;
    const multiple = parent === 'false' ? false : true;
    new Accordion($(this), multiple);
  }
}

customElements.define('accordion-component', AccordionComponent);
    
class Slider extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.querySelector('[data-carousel-param]');
    this.init();
  }

  init() {
	const defaults = {
                effect: 'slide',
                direction: 'horizontal',
                autoplay: true,
                autoplaySpeed: 5,
                space: 30,
                col: 2,
                col_sm: 2,
                col_md: 3,
                col_lg: 4,
                col_xl: 5,
                col_xxl: 6,
                row: 1,
                rowMobile: 1,
                center: false,
                options: {},
            };
    // Get configuration
    const param = this.carousel.getAttribute('data-carousel-param');
    if (param === null || param === '') {
      return null;
    }
    const config = $.extend(true, defaults, JSON.parse(param));
    const isNumberic = /^\d+$/;
    Object.keys(config).forEach((key) => {
      if (typeof config[key] === 'string' && isNumberic.test(config[key])) {
        config[key] = parseInt(config[key], 10);
      }
    });
    // Prepare auto play variable
    // -----------------
    let autoplay = false;
    if (config.autoplay === 'true' || config.autoplay === true) {
      autoplay = {
        delay: config.autoplaySpeed,
        disableOnInteraction: false,
      };
    }
    // Make sure the carousel has a item
    const items = this.carousel.querySelectorAll('[data-carousel-item]');
    if (items.length === 0) {
      return this;
    }
    // Check number of images for loop mode
    // ------------------------------------
    let loop = false;
    if (config.loop === 'true' || config.loop === true) {
      loop = true;
    }

    let rowMobile = config.row;
    if (config.rowMobile && config.rowMobile !== '') {
      rowMobile = config.rowMobile;
    }
    // Carousel options
    // -----------------
    const option = $.extend(true, {
      init: false,
      slidesPerView: config.col,
      slidesPerColumn: config.row,
      spaceBetween: config.space,
      loop,
      direction: config.direction,
      preloadImages: false,
      centeredSlides: (config.center === 'true' || config.center === true),
      navigation: {
        nextEl: this.carousel.querySelector('[data-carousel-nav-next]'),
        prevEl: this.carousel.querySelector('[data-carousel-nav-prev]'),
      },
      pagination: {
        el: this.carousel.querySelector('[data-carousel-pagination]'),
        clickable: true,
        modifierClass: 'carousel-pagination-',
        bulletClass: 'carousel-pagination-bullet',
        bulletActiveClass: 'carousel-pagination-bullet-active',
        currentClass: 'carousel-pagination-current',
        totalClass: 'carousel-pagination-total',
        hiddenClass: 'carousel-pagination-hidden',
      },
      effect: config.effect,
      autoplay,
      lazy: true,
      breakpoints: {
        576: {
          slidesPerView: config.col_sm,
          spaceBetween: 20,
          slidesPerColumn: rowMobile,
        },
        768: {
          slidesPerView: config.col_md,
          spaceBetween: 20,
          slidesPerColumn: config.row,
        },
        992: {
          slidesPerView: config.col_lg,
          slidesPerColumn: config.row,
        },
        1200: {
          slidesPerView: config.col_xl,
          slidesPerColumn: config.row,
        },
        1400: {
          slidesPerView: config.col_xxl,
          slidesPerColumn: config.row,
        },
      },
    }, config.options);
    // Prepare container for swiper
    // ----------------------------
    const container = this.carousel.querySelector('[data-carousel-container]');
    // Get Instance from swiper
    // ------------------------
    const instance = new Swiper(container, option);
    // On initializing
    instance.on('init', () => {
                instance.wrapperEl.classList.remove('row');
    const slides = Array.from(instance.slides);
    if (slides) {
      slides.forEach((slide) => {
        slide.classList.remove('col');
      });
    }
    instance.update();
    });
    instance.init();
  }
}

customElements.define('slider-component', Slider);

class Tabs extends HTMLElement {
  constructor() {
    super();
    const id = this.dataset.tabId;
    this.tabstitle = this.querySelectorAll('[data-tabs-title]');
    this.tabspanel = this.querySelectorAll('[data-tabs-panel]');
    $(this.tabstitle).click((event) => {
      const $this = $(event.currentTarget);
      const $child = $this.find('a');
      if (!$this.hasClass('is-active')) {
      	const idTab = $child.attr('href');
        $(this.tabstitle).removeClass('is-active');
        $(this.tabspanel).removeClass('is-active');
        $this.addClass('is-active');
        $(idTab).addClass('is-active');
      }
      return false;
    });
  }
}

customElements.define('tab-component', Tabs);

class TabCollections extends HTMLElement {
  constructor() {
    super();
    this.setData();
    const $this = this;
    const scrollBottom = document.documentElement.scrollTop + document.documentElement.offsetHeight;
    scrollBottom >= (this.offsetTop - 200) ? this.renderSectionFromFetch(this.handle) : (this.onScrollHandler = this.onScroll.bind(this), window.addEventListener('scroll', this.onScrollHandler, false));
    
    this.debouncedOnSubmit = debounce((event) => {
      this.loading.classList.add('is-loading');
      this.onSubmitHandler(event);
    }, 0);
    
    Array.from(this.tabstitle).forEach(function(element) {
      element.addEventListener('click', $this.debouncedOnSubmit.bind($this));
    });
  }

  onScroll() {
    const scrollBottom = document.documentElement.scrollTop + document.documentElement.offsetHeight;
    if (scrollBottom > (this.offsetTop - 200)) {
      this.renderSectionFromFetch(this.handle);
      window.removeEventListener('scroll', this.onScrollHandler);
    }
  }
  
  setData() {
    this.tabsData = [];
    
    this.tabstitle = this.querySelectorAll('[data-tabs-title]');
    this.handle = this.tabstitle[0].dataset.tabsCollection;
    
    this.tabspanel = this.querySelectorAll('[data-tabs-panel]');
    this.limit = this.tabspanel[0].dataset.tabsCollectionLimit;
    this.param = this.tabspanel[0].dataset.tabsCarouselParam;
    this.navigation = this.tabspanel[0].dataset.tabsCarouselNavigation;
    this.pagination = this.tabspanel[0].dataset.tabsCarouselPagination;
    
    this.loading = this.querySelectorAll('[data-tabs-collection-loading]')[0];
  }

  onSubmitHandler(event) {
    event.preventDefault();
    Array.from(this.tabstitle).forEach(function(element) {
      element.classList.remove('is-active');
    });
    const $this = event.target.closest('[data-tabs-title]');
    $this.classList.add('is-active');
    const handle = $this.dataset.tabsCollection;
    this.renderPage(handle, event);
  }
  
  renderPage(handle, event) {
    const filterDataUrl = element => element.handle === handle;
    this.tabsData.some(filterDataUrl) ?
      this.renderSectionFromCache(filterDataUrl, event) :
      this.renderSectionFromFetch(handle, event);
  }

  renderSectionFromCache(filterDataUrl, event) {
    const html = this.tabsData.find(filterDataUrl).html;
    this.renderProductGrid(html.querySelectorAll('.collection-loadTab')[0]);
  }
  
  renderSectionFromFetch(handle, event) {
    let url = '';
    if (handle != '') {
      url = handle + '?view=loadTab&limit=' + this.limit;
    } else {
      url = '/collections/all?view=loadTab-sample&limit=' + this.limit;
    }
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        html.querySelectorAll('.carousel')[0].dataset.carouselParam = this.param;
        if (this.navigation == 'true') {
          html.querySelectorAll('.carousel-navigation-content')[0].innerHTML = '<div class="carousel-navigation carousel-nav-prev" data-carousel-nav-prev><i class="cs-icon icon-ios-arrow-left"></i></div><div class="carousel-navigation carousel-nav-next" data-carousel-nav-next><i class="cs-icon icon-ios-arrow-right"></i></div>';
        }
        if (this.pagination == 'true') {
		  html.querySelectorAll('.carousel-pagination-content')[0].innerHTML = '<div class="carousel-pagination" data-carousel-pagination></div>';
        }
        this.tabsData = [...this.tabsData, { html, handle }];
        this.renderProductGrid(html.querySelectorAll('.collection-loadTab')[0]);
      });
  }
  renderProductGrid(html) {
    this.tabspanel[0].innerHTML = html.innerHTML;
    this.loading.classList.remove('is-loading');
  }
}
customElements.define('tab-collection-component', TabCollections);

class StickySidebar {
  constructor() {
    Array.from(document.querySelectorAll('[data-sticky-sidebar]')).forEach(function(element) {
      const top = parseInt(element.dataset.stickySidebar);
      $(element).theiaStickySidebar({
        additionalMarginTop: top
      });
    });
  }
}

new StickySidebar();

class StickyHeader {
  constructor() {
    Array.from(document.querySelectorAll('[data-sticky]')).forEach(function(element) {
      const $element = $(element);
      const params = $element.data('sticky');
      if (params) {
        params.onStart = () => {
          const $prev = $element.prev();
          $prev.css({
            transition: 'height 0.3s linear',
          });
          setTimeout(() => {
            $prev.css('height', $element.outerHeight());
          }, 300);
        };
        new hcSticky(element, params).refresh();
      }
    });
  }
}

new StickyHeader();

class ProductCart extends HTMLElement {
  constructor() {
    super();

	this.cartDropdown = document.querySelector('cart-dropdown-bubble');
	this.action = this.querySelector('a');
	this.idVariant = parseInt(this.action.dataset.addCart);
	this.action.addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick(event) {
    event.preventDefault();
    if (this.action.classList.contains('loading')) return;

    this.action.setAttribute('aria-disabled', true);
    this.action.classList.add('loading');

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    const formData = {
      'items': [
        {
          'id': this.idVariant,
          'quantity': 1
        }
      ]
    };

	let formQuantity = [];
    formQuantity[this.idVariant] = 1;

    config.body = JSON.stringify({
      ...formData,
      sections: this.cartDropdown.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });
	ajaxCart(config, formQuantity, this.action);
  }
}

customElements.define('product-cart', ProductCart);

class ProductWishlist extends HTMLElement {
  constructor() {
    super();
    
	this.action = this.querySelector('a');
	this.handle = this.action.dataset.wishlistHandle;
    this.add = this.action.dataset.add;
    this.added = this.action.dataset.added;
	this.action.addEventListener('click', this.onButtonClick.bind(this));
    this.show();
  }
  
  onButtonClick(event) {
    event.preventDefault();
    let data = localStorage.getItem('wishlist-storage');
    if (data !== null && data !== '[]' && data !== '[null]') {
      data = JSON.parse(data);
    } else {
      data = [];
    }
    const index = data.indexOf(this.handle);
    if (index !== -1) {
      data.splice(index, 1);
      $(`[data-wishlist-handle="${this.handle}"]`).removeClass('is-added');
      $(`[data-wishlist-handle="${this.handle}"]`).attr('title', this.add);
    } else {
      data.push(this.handle);
      $(`[data-wishlist-handle="${this.handle}"]`).addClass('is-added');
      $(`[data-wishlist-handle="${this.handle}"]`).attr('title', this.added);
    }
    localStorage.setItem('wishlist-storage', JSON.stringify(data));
  }
  
  show() {
    const session = localStorage.getItem('wishlist-storage');
    if (session !== null && session !== '[]' && session !== '[null]') {
      const index = session.indexOf(this.handle);
      if (index !== -1) {
        this.action.classList.add('is-added');
        this.action.title = this.added;
      }
    } 
  }
}

customElements.define('product-wishlist', ProductWishlist);

class ProductCompare extends HTMLElement {
  constructor() {
    super();
    
	this.action = this.querySelector('a');
	this.handle = this.action.dataset.compareHandle;
    this.add = this.action.dataset.add;
    this.added = this.action.dataset.added;
	this.action.addEventListener('click', this.onButtonClick.bind(this));
    this.show();
  }
  
  onButtonClick(event) {
    event.preventDefault();
    let data = localStorage.getItem('compare-storage');
    if (data !== null && data !== '[]' && data !== '[null]') {
      data = JSON.parse(data);
    } else {
      data = [];
    }
    const index = data.indexOf(this.handle);
    if (index !== -1) {
      data.splice(index, 1);
      $(`[data-compare-handle="${this.handle}"]`).removeClass('is-added');
      $(`[data-compare-handle="${this.handle}"]`).attr('title', this.add);
    } else {
      data.push(this.handle);
      $(`[data-compare-handle="${this.handle}"]`).addClass('is-added');
      $(`[data-compare-handle="${this.handle}"]`).attr('title', this.added);
    }
    localStorage.setItem('compare-storage', JSON.stringify(data));
  }
  
  show() {
    const session = localStorage.getItem('compare-storage');
    if (session !== null && session !== '[]' && session !== '[null]') {
      const index = session.indexOf(this.handle);
      if (index !== -1) {
        this.action.classList.add('is-added');
        this.action.title = this.added;
      }
    } 
  }
}

customElements.define('product-compare', ProductCompare);

class ScrollTop extends HTMLElement {
  constructor() {
    super();
    
    this.action = this.querySelector('a');
    window.addEventListener('scroll', this.onScroll.bind(this), false);
    this.action.addEventListener('click', this.onButtonClick.bind(this));
  }
  
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollTop > 100 ? this.action.classList.add('is-show') : this.action.classList.remove('is-show');
  }
  
  onButtonClick(event) {
    event.preventDefault();
    
    window.setTimeout(() => { document.body.scrollIntoView({behavior: "smooth"}); });
  }
}

customElements.define('scroll-top', ScrollTop);

class ShippingDate extends HTMLElement {
  constructor() {
    super();
    this.shipdate = this.querySelector('[data-shipdate]');
    const shipday = parseInt(this.shipdate.dataset.shipdate);
    const currentday = new Date();
    currentday.setDate(currentday.getDate() + shipday);
    const newmonth = currentday.getMonth() + 1;
    const newyear = currentday.getFullYear();
    const newdate = currentday.getDate();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const newday = days[currentday.getDay()];
    const newmodedate = `${newday} ${newdate}/${newmonth}/${newyear}`;
    this.shipdate.innerHTML = newmodedate;
  }
}

customElements.define('shipping-date', ShippingDate);

class Countdown extends HTMLElement {
  constructor() {
    super();
    this.timer = this.querySelector('[data-timer]');
    const timervalue = this.timer.dataset.timervalue;
    const languages = JSON.parse(this.timer.dataset.timerLanguages);
    const point = this.timer.dataset.timerPoint;
    let day = '',
        hour = '',
        minute = '',
        second = '',
        htmlPoint = '';
    if (languages.days !== '') day = `<span class="language">${languages['days']}</span>`;
    if (languages.hours !== '') hour = `<span class="language">${languages['hours']}</span>`;
    if (languages.minutes !== '') minute = `<span class="language">${languages['minutes']}</span>`;
    if (languages.seconds !== '') second = `<span class="language">${languages['seconds']}</span>`;
    if (point !== '') htmlPoint = `<span class="point">${point}</span>`;
    $(this.timer).countdown(timervalue, (event) => {
      const $this = $(event.currentTarget);
      $this.html(event.strftime(`<div class='timer'><span class='number'>%D</span>${day}${htmlPoint}<span class='number'>%H</span>${hour}${htmlPoint}<span class='number'>%M</span>${minute}${htmlPoint}<span class='number'>%S</span>${second}</div>`));
    });
  }
}

customElements.define('countdown-component', Countdown);