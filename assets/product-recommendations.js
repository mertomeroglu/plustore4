class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
	  this.classList.add('is-loading');
      fetch(this.dataset.url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('product-recommendations');
        if (recommendations && recommendations.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
          this.classList.remove('is-loading');
        }
      })
      .catch(e => {
        console.error(e);
      });
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 200px 0px'}).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);