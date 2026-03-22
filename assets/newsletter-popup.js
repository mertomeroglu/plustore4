class NewsletterPopup extends HTMLElement {
  constructor() {
    super();
    this.id = this.dataset.section;
    const delay = parseInt(`${this.dataset.delay}000`);
    const frequency = parseInt(this.dataset.frequency);
    this.date = this.dataset.timer;
    let show = false;
    
    if (localStorage.getItem('cs-newsletter') === '' || localStorage.getItem('cs-newsletter') === null || localStorage.getItem('cs-newsletter') === undefined) {
      show = true;
    } else {
      let checkTime = new Date(this.date) - new Date(localStorage.getItem('cs-newsletter'));
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
      }, delay);
    }
  }
  
  show() {
    document.body.classList.add('modal-loading');
    this.classList.add('modal-open');
    this.close();
  }
  
  close() {
    window.onkeyup = (event) => {
      if(event.code.toUpperCase() === 'ESCAPE') this.onButtonClick(event)
    }
    
    this.querySelectorAll('[data-modal-close]').forEach(
      (action) => {
        action.addEventListener('click', this.onButtonClick.bind(this));
      }
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    
    const checkbox = document.getElementById(`newsletter-notification-${this.id}`);
    if (checkbox !== '' && checkbox !== undefined && checkbox !== null) {
      checkbox.checked ? localStorage.setItem('cs-newsletter', this.date) : localStorage.setItem('cs-newsletter', '');
    }
    document.body.classList.remove('modal-loading');
    this.classList.remove('modal-open');
  }
}

customElements.define('newsletter-popup', NewsletterPopup);