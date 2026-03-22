class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    const slideshow = this.querySelector('[data-index-slideshow]');
    const selectors = {
      container: '[data-slideshow-container]',
      slide: '[data-slideshow-slide]',
      background: '[data-slideshow-bkg]',
      caption: '[data-slideshow-caption]',
      captionText: '[data-slideshow-caption-text]',
      next: '[data-slideshow-nav-next]',
      prev: '[data-slideshow-nav-prev]',
      pagination: '[data-slideshow-pagination]',
      video: '[data-slideshow-video]',
      videoPlace: '[data-slideshow-video-place]',
      videoFile: '[data-slideshow-video-file]',
      videoFilePlace: '[data-slideshow-video-file-place]',
    };
    const params = {
      slideshow: 'data-slideshow-param',
      caption: 'data-slideshow-caption',
      video: 'data-slideshow-video',
      videoIndex: 'data-slideshow-video-index',
      videoFile: 'data-slideshow-video-file',
      videoFileIndex: 'data-slideshow-video-file-index',
    };
    const timer = {};
    let instance = null;
    // Initialize slideshow
    // -------------------
    if (slideshow !== undefined) {
      // Get configuration
      const param = attr(slideshow, params.slideshow);
      if (param === null || param === '') {
        return null;
      }
      const config = JSON.parse(param);
      // Prepare dimension
      //------------------
      this.height = parseInt(config.height, 10) || slideshow.clientHeight;
      this.width = parseInt(config.width, 10) || slideshow.clientWidth;
      // Prepare container for swiper
      // ----------------------------
      const container = find(selectors.container, slideshow);
      container.style.height = `${((slideshow.offsetWidth / this.width) * this.height).toFixed(4)}px`;
      // Make sure the slideshow has a slide
      const slides = Array.from(findAll(selectors.slide, slideshow));
      if (!slides) {
        return this;
      }
      // Text caption offset
      const textRendering = (text) => {
        let fontSize = attr(text, 'data-font-size');
        if (fontSize === null || fontSize === '') {
          fontSize = window.getComputedStyle(text, null).getPropertyValue('font-size').replace('px', '');
          attr(text, 'data-font-size', fontSize);
        }
        const size = ((slideshow.offsetWidth / this.width) * parseFloat(fontSize));
        text.style.fontSize = (size > 10) ? `${size.toFixed(4)}px` : '10px'; // eslint-disable-line
      };
      // Set Entrancing effect for captions in first slide
      // -------------------------------------
      if (slides) {
        slides.forEach((slide, index) => {
          const captions = Array.from(findAll(selectors.caption, slide));
          let delay = 50 * (captions.length - 1);
          if (captions) {
            captions.forEach((caption) => {
              const image = caption;
              const captionParam = attr(caption, params.caption);
              if (captionParam !== null && captionParam !== '') {
                const captionConfig = JSON.parse(captionParam);
                const parent = caption.parentNode;
                if (parent) {
                  const positionY = parseFloat(captionConfig.positionY).toFixed(4);
                  const positionX = parseFloat(captionConfig.positionX).toFixed(4);
                  const parentCss = {
                    position: 'absolute',
                    top: `${positionY}%`,
                    width: (image) ? `${(image.naturalWidth / this.width) * 100}%` : 'auto',
                    'z-index': parseInt(captionConfig.zIndex, 10) || 99,
                  };
                  if (_this.isRTL()) {
                    parentCss.right = `${positionX}%`;
                    parentCss.left = 'auto';
                    if (captionConfig.align === 'left') {
                      parentCss.transform = 'translateX(100%)';
                    } else if (captionConfig.align === 'center') {
                      parentCss.transform = 'translateX(50%)';
                    } else {
                      parentCss.transform = 'translateX(0)';
                    }
                  } else {
                    parentCss.left = `${positionX}%`;
                    parentCss.right = 'auto';
                    if (captionConfig.align === 'left') {
                      parentCss.transform = 'translateX(-100%)';
                    } else if (captionConfig.align === 'center') {
                      parentCss.transform = 'translateX(-50%)';
                    } else {
                      parentCss.transform = 'translateX(0)';
                    }
                  }
                  Object.keys(parentCss).forEach((property) => {
                    parent.style[property] = parentCss[property];
                  });
                }
                const css = {
                  position: 'relative',
                  'animation-delay': `${delay}ms`,
                };
                Object.keys(css).forEach((property) => {
                  caption.style[property] = css[property]; // eslint-disable-line
                });
                if (captionConfig.type === 'text') {
                  attr(caption, selectors.captionText.replace(/\[|\]/g, ''), 'true');
                  textRendering(caption);
                }
                if (index === 0) {
                  caption.classList.add(captionConfig.entranceEffect);
                } else {
                  caption.classList.add(captionConfig.exitEffect);
                }
              }
              delay -= 50;
            });
          }
        });
      }
      // Prepare auto play variable
      // -----------------
      let autoplay = false;
      if (config.autoplay === 'true') {
        autoplay = {
          delay: parseInt(config.autoplaySpeed, 10),
          disableOnInteraction: false,
        };
      }
      // Get Instance from swiper
      // ------------------------
      instance = new Swiper(container, {
        init: false,
        slidesPerView: 1,
        loop: slides.length,
        direction: 'horizontal',
        preloadImages: false,
        navigation: {
          nextEl: find(selectors.next, slideshow),
          prevEl: find(selectors.prev, slideshow),
        },
        pagination: {
          el: find(selectors.pagination, slideshow),
          clickable: true,
          modifierClass: 'index-slideshow-pagination-',
          bulletClass: 'index-slideshow-pagination-bullet',
          bulletActiveClass: 'index-slideshow-pagination-bullet-active',
          currentClass: 'index-slideshow-pagination-current',
          totalClass: 'index-slideshow-pagination-total',
          hiddenClass: 'index-slideshow-pagination-hidden',
        },
        effect: config.effect,
        autoplay,
        lazy: {
          loadPrevNext: true,
        },
      });
      // Assign videos
      // --------------
      const player = {};
      const playerFile = {};
      instance.on('init', () => {
        const captionText = Array.from(findAll(selectors.captionText, slideshow));
        if (captionText) {
          captionText.forEach((text) => {
            text.classList.remove('hidden');   
          });
        } 
      });
      instance.init();
      // Slideshow captions control
      // -----------------
      // On Transition starting
      instance.on('slideChangeTransitionStart', () => {
        for (let index = 0; index < instance.slides.length; index++) {
          if (index !== instance.activeIndex) {
            const slideCaptions = Array.from(findAll(selectors.caption, instance.slides[index]));
            if (slideCaptions) {
              slideCaptions.forEach((caption) => {
                const captionParam = attr(caption, params.caption);
                if (captionParam !== null && captionParam !== '') {
                  const captionConfig = JSON.parse(captionParam);
                  // Add the exit effect for all slides except current slide
                  caption.classList.remove(captionConfig.entranceEffect);
                  caption.classList.add(captionConfig.exitEffect);
                }
              });
            }
            const slideVideos = Array.from(findAll(selectors.video, instance.slides[index]));
            const slideVideosFile = Array.from(findAll(selectors.videoFile, instance.slides[index]));
            if (slideVideos || slideVideosFile) {
              _this.pauseAllMedia(slideshow);
            }
          } else {
            if(find(selectors.background, instance.slides[index])){
              find(selectors.background, instance.slides[index]).classList.remove('hidden');
            }
            const captionText = Array.from(findAll(selectors.captionText, instance.slides[index]));
            if (captionText) {
              captionText.forEach((text) => {
                textRendering(text);
              });
            }
          }
        }
      });
	  // On Transition end
      instance.on('slideChangeTransitionEnd', () => {
        const slideCaptions = Array.from(findAll(selectors.caption, instance.slides[instance.activeIndex]));
        if (slideCaptions) {
          slideCaptions.forEach((caption, index) => {
            const captionParam = attr(caption, params.caption);
            const captionIndex = `${instance.activeIndex}-${index}`;
            if (captionParam !== null && captionParam !== '') {
              const captionConfig = JSON.parse(captionParam);
              // Add the entrancing effect to current slide
              caption.classList.remove(captionConfig.exitEffect);
              caption.classList.add(captionConfig.entranceEffect);
              // Check exit effect timer for this slide, if it exists, clear it.
              if (timer[captionIndex] !== undefined && timer[captionIndex] !== null) {
                clearTimeout(timer[captionIndex]);
                timer[captionIndex] = null;
              }
              // Set exit effect timer
              timer[captionIndex] = setTimeout(() => {
                caption.classList.remove(captionConfig.entranceEffect);
                caption.classList.add(captionConfig.exitEffect);
                timer[instance.activeIndex] = null;
              }, (parseInt(config.autoplaySpeed, 10) - 1000));
            }
          });
        }
        // Video Youtube control
        const slideVideos = Array.from(findAll(selectors.video, instance.slides[instance.activeIndex]));
        if (slideVideos.length > 0) {
          _this.playAllMedia(slideVideos[0]);
        }
        instance.update();
      });
      // Slideshow responsve control
      // ---------------------------
      // Slideshow on resize to set slideshow's height
      instance.on('resize', () => {
        container.style.height = `${((slideshow.offsetWidth / this.width) * this.height).toFixed(4)}px`;
        const textCaptions = Array.from(findAll(selectors.captionText, instance.slides[instance.activeIndex]));
        if (textCaptions) {
          textCaptions.forEach((textCaption) => {
            textRendering(textCaption);
          });
        }
      });
      instance.on('beforeDestroy', () => {
        removeAttr(container, 'style');
        const captions = Array.from(findAll(selectors.caption, slideshow));
        if (captions) {
          captions.forEach((caption) => {
            removeAttr(caption, 'style');
          });
        }
      });
      instance.update();
    }
//     return instance;
  }

  isRTL() {
    return document.querySelector('html[dir="rtl"]');
  }

  pauseAllMedia($this) {
    $this.querySelectorAll('.js-youtube').forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });
    $this.querySelectorAll('.js-vimeo').forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    $this.querySelectorAll('video').forEach((video) => video.pause());
  }

  playAllMedia($this) {
    $this.querySelectorAll('.js-youtube').forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
    });
    $this.querySelectorAll('.js-vimeo').forEach((video) => {
      video.contentWindow.postMessage('{"method":"play"}', '*');
    });
    $this.querySelectorAll('video').forEach((video) => video.play());
  }
}


customElements.define('slideshow-component', SlideshowComponent);