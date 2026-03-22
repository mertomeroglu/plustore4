class ProductMedia extends HTMLElement {
  constructor() {
    super();
    
    this.slider();  
  }
 
  slider() {
    const thumbnail = find('[data-product-thumbnail]', this);
    const gallery = find('[data-product-gallery]', this);
    if (gallery && thumbnail) {
      this.images = findAll('[data-carousel-item] [data-carousel-media-image]', gallery);
      const galleryList = findAll('[data-carousel-item] [data-media-id]', gallery);
      const numImages = galleryList.length;
      const thumbnailsView = numImages > 4 ? 4 : numImages;
      // Initialize gallery slider
      const galleryInstance = new Swiper(find('[data-carousel-container]', gallery), {
        init: false,
        slidesPerView: 1,
        centeredSlides: false,
        loop: numImages > 1,
        loopedSlides: numImages,
        direction: 'horizontal',
        preloadImages: false,
        spaceBetween: 7,
        lazy: {
          loadPrevNext: true,
        },
        navigation: {
          nextEl: find('[data-carousel-nav-next]', gallery),
          prevEl: find('[data-carousel-nav-prev]', gallery),
        },
        pagination: {
          el: find('[data-carousel-pagination]', gallery),
          clickable: true,
          modifierClass: 'carousel-pagination-',
          bulletClass: 'carousel-pagination-bullet',
          bulletActiveClass: 'carousel-pagination-bullet-active',
          currentClass: 'carousel-pagination-current',
          totalClass: 'carousel-pagination-total',
          hiddenClass: 'carousel-pagination-hidden',
        },
      });
      galleryInstance.init();
      // Initialize thumbnail slider
      const position = thumbnail.dataset.productThumbnail;
      let direction = 'vertical';
      let slidesPerView = numImages > 4 ? 4 : numImages;
      if (position == 'bottom') {
        direction = 'horizontal';
        slidesPerView = 4;
      }
      const thumbnailInstance = new Swiper(find('[data-carousel-container]', thumbnail), {
        init: false,
        slidesPerView: slidesPerView,
        loop: numImages > 1,
        loopedSlides: numImages,
        spaceBetween: 10,
        direction: direction,
        slidesOffsetBefore: 0,
        centeredSlides: false,
        slideToClickedSlide: true,
        navigation: {
          nextEl: find('[data-carousel-nav-next]', thumbnail),
          prevEl: find('[data-carousel-nav-prev]', thumbnail),
        },
      });
      // Set height to thumbnail slider
      const thumbnailRender = () => {
        if ($(thumbnail).is(':visible')) {
          const image = find('[data-carousel-item] img', thumbnail);
          if (image) {
            const space = thumbnailInstance.params.spaceBetween;
            const wrapperHeight = ((image.offsetHeight + space) * thumbnailsView) - space;
            thumbnailInstance.wrapperEl.style.maxHeight = `${wrapperHeight}px`;
          }
          thumbnailInstance.update();
        }
      };
      thumbnailInstance.on('resize', () => {
        thumbnailRender();
      });
      thumbnailInstance.on('init', () => {
        thumbnailRender();
      });
      thumbnailInstance.init();
      thumbnailInstance.controller.control = galleryInstance;
	  galleryInstance.controller.control = thumbnailInstance;
      setTimeout(() => {
        thumbnailRender();   
	    thumbnailInstance.update(); 
        galleryInstance.update();        
                 
	    const $this =  $(gallery.querySelectorAll('[data-carousel-item]')[galleryInstance.activeIndex]);
      	const idActive = $this.data('carousel-item');
        const idVariant = $('[data-variant-image]').val();
        if (idActive != idVariant) {
		  const index = $(`[data-carousel-item="${idVariant}"]`, gallery).data('swiper-slide-index');
          if (!Number.isNaN(index) && index !== undefined) {
            galleryInstance.slideToLoop(index);
          }
        }
      }, 1000);
      
	  $('[data-variant-image]').on('change', (event) => {
        const idImage = $(event.currentTarget).val();
        const index = $(`[data-carousel-item="${idImage}"]`, gallery).data('swiper-slide-index');
        if (!Number.isNaN(index) && index !== undefined) {
          galleryInstance.slideToLoop(index);
        }
      });

	  galleryInstance.on('slideChangeTransitionStart', () => {
        window.pauseAllMedia();
		galleryInstance.allowTouchMove = true;
      });
      galleryInstance.on('slideChangeTransitionEnd', () => {
        const $this =  gallery.querySelectorAll('[data-carousel-item]')[galleryInstance.activeIndex];
        if (find('product-model', $this)) {
          galleryInstance.allowTouchMove = false;
          if (find('product-model', $this).hasAttribute('loaded')) {
             window.playAllMedia($this);   
          } else {
            $($this.querySelectorAll('button')[0]).click();
          }
        }
        if (find('deferred-media', $this)) {
          if (find('deferred-media', $this).hasAttribute('loaded')) {
             window.playAllMedia($this);   
          } else {
            $($this.querySelectorAll('button')[0]).click();
          }
        }
      });

    }
  }
}
customElements.define('product-media-component', ProductMedia);