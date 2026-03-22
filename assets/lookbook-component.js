class LookbookComponent extends HTMLElement {
  constructor() {
    super();
    
    this.items = [];
    this.content = this.querySelectorAll('.lookbook-item__image-zoom');
    this.content.forEach((image, index) => {
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
    
    this.content.forEach(
      (zoom) => zoom.addEventListener('click', (event) => {
        event.currentTarget;
        initializeGallery(0);
      })
    );
  }
}
customElements.define('lookbook-component', LookbookComponent);