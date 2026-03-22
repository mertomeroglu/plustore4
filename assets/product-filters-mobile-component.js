class ProductFiltersMobileComponent extends HTMLElement {
  constructor() {
    super();
    this.handle = this.dataset.filterHandle;
    this.classList.add('is-loading');
    this.menu = this.closest('menu-drawer');
    const url = `${this.handle}?view=filter-mobile`;
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.innerHTML = html.getElementById('product-filters-mobile-form').innerHTML;
        this.classList.remove('is-loading');
        this.mainDetailsToggle = this.querySelector('details');
        this.menu.bindEvents();
        this.submitForm();
        this.querySelectorAll('input[type="range"]')
        .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
      });
  }
  
  submitForm() {
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
  }
  
  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    const url = `${this.handle}?${searchParams}`;
    window.location.href = url;
  }
  
  onRangeChange(event) {
    this.setMinAndMaxRangeValues();
  }
  
  setMinAndMaxRangeValues() {
    const inputs = this.querySelectorAll('input[type="number"]');
    const minInput = inputs[0];
    const maxInput = inputs[1];
	const ranges = this.querySelectorAll('input[type="range"]');
	let minRange = ranges[0];
    let maxRange = ranges[1];
	if (parseInt(maxRange.value) < parseInt(minRange.value)) {
      minRange = ranges[1];
      maxRange = ranges[0];
    }
	if (maxRange.value) {
	  maxInput.value = maxRange.value;
	}
    if (minRange.value) {
	  minInput.value = minRange.value;
    }
  }
}

customElements.define('product-filters-mobile-component', ProductFiltersMobileComponent);