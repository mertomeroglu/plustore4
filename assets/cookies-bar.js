class CookiesBar extends HTMLElement {
  constructor() {
    super();

    const delay = parseInt(`${this.dataset.delay}000`);
    const frequency = parseInt(this.dataset.frequency);
    this.date = this.dataset.timer;
    let show = false;
    
    if (localStorage.getItem('cs-cookies-bar') === '' || localStorage.getItem('cs-cookies-bar') === null || localStorage.getItem('cs-cookies-bar') === undefined) {
      show = true;
    } else {
      let checkTime = new Date(this.date) - new Date(localStorage.getItem('cs-cookies-bar'));
      const tamp = checkTime % 1000;
      checkTime = (checkTime - tamp) / 1000;
      const days = Math.floor(checkTime / 86400);
      if (days > frequency) {
        show = true;
      }
    }
    
    if (show) {
      setTimeout(() => {
        this.show();
        this.action = this.querySelector('[data-cookies-bar-close]');
        this.action.addEventListener('click', this.close.bind(this));
      }, delay);
    }
  }
  
  show() {
    this.classList.add('is-open');
  }

  close(event) {
    event.preventDefault();
    
    localStorage.setItem('cs-cookies-bar', this.date);
    this.classList.remove('is-open');
  }
}

customElements.define('cookies-bar', CookiesBar);