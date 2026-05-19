/* ============================================================
   MINDASCENT N MORE (MOS)
   main.js — UI Interactions, Navbar, Animations
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR — SCROLL BEHAVIOUR
   ============================================================ */

/**
 * Add .navbar--scrolled class when user scrolls past 50px
 * This triggers the dark background + blur effect
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };

  // Run on load in case page is already scrolled
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
}


/* ============================================================
   2. NAVBAR — HAMBURGER MENU TOGGLE (Mobile)
   ============================================================ */

/**
 * Toggle mobile menu open/close
 * Animates hamburger lines into X
 * Closes menu when a link is clicked
 */
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');
  if (!hamburgerBtn || !mobileMenu) return;

  // Toggle open/close
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.contains('is-open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when any mobile link is clicked
  const mobileLinks = mobileMenu.querySelectorAll('.navbar__mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside =
      hamburgerBtn.contains(e.target) ||
      mobileMenu.contains(e.target);

    if (!isClickInside && hamburgerBtn.classList.contains('is-open')) {
      closeMenu();
    }
  });

  function openMenu() {
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scroll behind menu
  }

  function closeMenu() {
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll
  }
}


/* ============================================================
   3. ACTIVE NAV LINK — HIGHLIGHT ON SCROLL
   ============================================================ */

/**
 * Highlights the correct nav link based on which
 * section is currently in the viewport
 */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          link.classList.remove('navbar__link--active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('navbar__link--active');
          }
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px'
  });

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   4. FADE-IN ON SCROLL ANIMATION
   ============================================================ */

/**
 * Uses IntersectionObserver to add .is-visible to
 * elements with .fade-in class when they enter the viewport
 */
function initScrollAnimations() {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Animate once only
      }
    });
  }, {
    threshold: 0.12
  });

  fadeEls.forEach(el => observer.observe(el));
}


/* ============================================================
   5. AUTO-APPLY FADE-IN TO KEY ELEMENTS
   ============================================================ */

/**
 * Adds .fade-in and stagger delay classes automatically
 * to product cards, section headers, about content, etc.
 * so we don't have to manually add them in HTML
 */
function applyFadeInClasses() {

  // Product cards — staggered
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.classList.add('fade-in');
    const delay = (index % 4) + 1; // cycles 1–4
    if (delay > 1) card.classList.add(`fade-in--delay-${delay}`);
  });

  // Section headers
  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('fade-in');
  });

  // About content sides
  document.querySelectorAll(
    '.about__image-side, .about__content-side'
  ).forEach((el, i) => {
    el.classList.add('fade-in');
    if (i === 1) el.classList.add('fade-in--delay-2');
  });

  // Contact cards — staggered
  document.querySelectorAll('.contact__card').forEach((card, index) => {
    card.classList.add('fade-in');
    if (index === 1) card.classList.add('fade-in--delay-2');
    if (index === 2) card.classList.add('fade-in--delay-3');
  });

  // Footer columns
  document.querySelectorAll('.footer__col').forEach((col, index) => {
    col.classList.add('fade-in');
    col.classList.add(`fade-in--delay-${index + 1}`);
  });
}


/* ============================================================
   6. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */

/**
 * Smooth scroll to section when clicking anchor links
 * Accounts for fixed navbar height offset
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 75;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY;
      const scrollTo     = targetTop - navbarHeight;

      window.scrollTo({
        top:      scrollTo,
        behavior: 'smooth'
      });
    });
  });
}


/* ============================================================
   7. PRODUCT CARD — QUICK VIEW (Image Click)
   ============================================================ */

function initProductImageLinks() {
  const imageWraps = document.querySelectorAll('.product-card__image-wrap');

  imageWraps.forEach(wrap => {
    wrap.style.cursor = 'zoom-in';
    wrap.addEventListener('click', function (e) {
      // Don't trigger if user clicked gallery nav buttons or wishlist button
      if (e.target.closest('.gallery-nav') || e.target.closest('.product-card__wishlist')) return;

      const img = this.querySelector('.product-card__image');
      const preloadContainer = this.querySelector('.hidden-gallery-assets');

      if (img && window.openMOSLightbox) {
        let imagesToDisplay = [img.src];
        let startIndex = 0;
        let altText = img.alt || 'Fragrance Detail';

        // If the card has hidden assets, use them for the lightbox gallery automatically
        if (preloadContainer) {
          const extraImages = Array.from(preloadContainer.querySelectorAll('img')).map(i => i.src);
          imagesToDisplay = [img.src, ...extraImages];
          // Find the current index in case user navigated the card gallery before clicking
          startIndex = imagesToDisplay.indexOf(img.src);
          if (startIndex === -1) startIndex = 0;
        }

        window.openMOSLightbox(imagesToDisplay, startIndex, altText);
      }
    });
  });
}

/**
 * Handles mini-gallery navigation inside product cards
 */
function initCardGalleries() {
  const galleries = document.querySelectorAll('.product-card__image-wrap--gallery');

  galleries.forEach(gallery => {
    const img = gallery.querySelector('.product-card__image');
    const preloadContainer = gallery.querySelector('.hidden-gallery-assets');
    if (!preloadContainer || !img) return;

    const images = [img.src, ...Array.from(preloadContainer.querySelectorAll('img')).map(i => i.src)];
    const prevBtn = gallery.querySelector('.gallery-nav--prev');
    const nextBtn = gallery.querySelector('.gallery-nav--next');

    const updateImage = (dir) => {
      let currentIndex = parseInt(img.getAttribute('data-index') || 0);
      currentIndex = (currentIndex + dir + images.length) % images.length;
      img.src = images[currentIndex];
      img.setAttribute('data-index', currentIndex);
    };

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateImage(-1);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateImage(1);
    });
  });
}


/* ============================================================
   8. NAVBAR ACTIVE LINK STYLE (CSS injection)
   ============================================================ */

/**
 * Inject the active link CSS style dynamically
 * so we don't need a separate CSS rule for it
 */
function injectActiveLinkStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .navbar__link--active {
      color: var(--color-gold-light) !important;
    }
    .navbar__link--active::after {
      width: 100% !important;
    }
    .btn--added {
      background: linear-gradient(135deg, #1a6b3a, #2ecc71) !important;
      color: #fff !important;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   9. BACK TO TOP BUTTON
   ============================================================ */

/**
 * Creates and manages a back-to-top button
 * that appears after scrolling 400px
 */
function initBackToTop() {
  // Create the button
  const btn = document.createElement('button');
  btn.id            = 'back-to-top';
  btn.innerHTML     = '<i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = `
    position: fixed;
    bottom: 5rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C9A84C, #E2C47A, #C9A84C);
    color: #0D0D0D;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
    z-index: 998;
    box-shadow: 0 4px 15px rgba(201, 168, 76, 0.35);
  `;
  document.body.appendChild(btn);

  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.opacity    = '1';
      btn.style.visibility = 'visible';
      btn.style.transform  = 'translateY(0)';
    } else {
      btn.style.opacity    = '0';
      btn.style.visibility = 'hidden';
      btn.style.transform  = 'translateY(10px)';
    }
  }, { passive: true });

  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Hover glow effect
  btn.addEventListener('mouseenter', () => {
    btn.style.boxShadow = '0 0 20px rgba(201, 168, 76, 0.6)';
    btn.style.transform = 'translateY(-2px)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.boxShadow = '0 4px 15px rgba(201, 168, 76, 0.35)';
    btn.style.transform = 'translateY(0)';
  });
}


/* ============================================================
   10. LAZY IMAGE LOADING FALLBACK
   ============================================================ */

/**
 * Fallback for browsers that don't support native lazy loading
 * Also adds a subtle fade-in when images load
 */
function initImageLoadEffects() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach(img => {
    // Add loaded class when image finishes loading
    if (img.complete) {
      img.classList.add('img--loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img--loaded'));
    }
  });

  // Inject image load style
  const style = document.createElement('style');
  style.textContent = `
    img[loading="lazy"] {
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    img[loading="lazy"].img--loaded {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   11. PAGE LOADER
   ============================================================ */
function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('page-loader--hidden');
    }, 500); // 500ms delay for smoother experience
  });
}

/* ============================================================
   12. IMAGE LIGHTBOX (Full View Logic)
   ============================================================ */
function initImageLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'image-lightbox';
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <div class="lightbox__content">
      <button class="lightbox__close" aria-label="Close image">&times;</button>
      <img src="" alt="" class="lightbox__img">
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const closeBtn    = lightbox.querySelector('.lightbox__close');
  const prevBtn     = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn     = lightbox.querySelector('.lightbox__nav--next');

  let currentImages = [];
  let currentImageIndex = 0;

  const showImage = (index) => {
    if (currentImages.length === 0) return;

    currentImageIndex = index;
    lightboxImg.src = currentImages[currentImageIndex];
    // The alt text is set once when openMOSLightbox is called,
    // it represents the context of the gallery/single image.
    // Individual images in a gallery might have their own alt, but for simplicity,
    // we'll use the alt passed to openMOSLightbox for the main lightbox image.

    prevBtn.style.display = currentImages.length > 1 && currentImageIndex > 0 ? 'flex' : 'none';
    nextBtn.style.display = currentImages.length > 1 && currentImageIndex < currentImages.length - 1 ? 'flex' : 'none';
  };

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) showImage(currentImageIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex < currentImages.length - 1) showImage(currentImageIndex + 1);
  });

  // Define global opener
  window.openMOSLightbox = (images, startIndex = 0, alt = 'Fragrance Detail') => {
    // Ensure images is always an array
    currentImages = Array.isArray(images) ? images : [images];
    lightboxImg.alt = alt; // Set alt for the whole gallery context or single image
    showImage(startIndex);

    lightbox.classList.add('is-visible');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock scrolling
    lightbox.scrollTop = 0; // Reset scroll to top
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-visible');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scrolling
    currentImages = []; // Clear images
    currentImageIndex = 0; // Reset index
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ============================================================
   13. PRODUCT SHOWCASE CAROUSEL (New Section)
   ============================================================ */

const showcaseProducts = [
  {
    id: 'showcase-1',
    name: 'SUMMER PINK',
    category: 'Eau de Parfum',
    description: 'A vibrant and refreshing blend of citrus and floral notes.',
    price: 3500,
    image: 'img/img20.jpeg'
  },
  {
    id: 'showcase-2',
    name: 'Queen Of Roses',
    category: 'Eau de Parfum',
    description: 'An opulent bouquet of damask rose and oriental spices, radiating royal elegance and grace.',
    price: 42000,
    image: 'img/img21.jpeg'
  },
  {
    id: 'showcase-3',
    name: 'KHAMRAH QAHWA',
    category: 'Eau de Parfum',
    description: 'A warm, decadent fusion of aromatic coffee, spicy cinnamon, and sweet praline—the ultimate winter indulgence.',
    price: 40000,
    image: 'img/img22.jpeg'
  },
  {
    id: 'showcase-4',
    name: 'REEF 33',
    category: 'Eau de Parfum',
    description: 'A sophisticated blend of floral and woody notes, with a hint of musk, embodying modern elegance.',
    price: 90000,
    image: 'img/img23.jpeg'
  },
  {
    id: 'showcase-5',
    name: 'ISHQ AL SHUYUKH GOLD',
    category: 'Eau de Parfum',
    description: 'A luxurious blend of caramel, saffron, and vanilla, with a rich woody base for a captivating aroma.',
    price: 45000,
    image: 'img/img24.jpeg'
  },
  {
    id: 'showcase-6',
    name: 'ECLAIRE',
    category: 'Eau de Parfum',
    description: 'A decadent gourmand symphony of creamy vanilla, warm caramel, and honeyed sugar—the viral sensation of pure sweetness.',
    price: 45000,
    image: 'img/img25.jpeg'
  },
  {
    id: 'showcase-7',
    name: 'QISSA DELICIOUS',
    category: 'Eau de Parfum',
    description: 'A luscious gourmand masterpiece by Paris Corner, blending rich dark chocolate, whipped cream, and marshmallow for a truly decadent trail.',
    price: 28000,
    image: 'img/img26.jpeg'
  },
  {
    id: 'showcase-8',
    name: 'LAZURDE ROUGE',
    category: 'Extrait de Parfum',
    description: 'A vibrant and passionate blend of red fruits, exotic florals, and warm amber, perfect for summer nights.',
    price: 20000,
    image: 'img/img27.jpeg'
  }
];

let currentShowcaseIndex = 0;

function initProductShowcase() {
  const carousel = document.querySelector('.product-showcase__carousel');
  if (!carousel) return;

  const prevBtn = carousel.querySelector('.product-showcase__nav--prev');
  const nextBtn = carousel.querySelector('.product-showcase__nav--next');
  const showcaseImage = carousel.querySelector('.product-showcase__image');
  const showcaseCategory = carousel.querySelector('.product-showcase__category');
  const showcaseName = carousel.querySelector('.product-showcase__name');
  const showcaseDescription = carousel.querySelector('.product-showcase__description');
  const showcasePrice = carousel.querySelector('.product-showcase__price');
  const addToCartBtn = carousel.querySelector('.add-to-cart-showcase-btn');

  const updateShowcase = () => {
    const product = showcaseProducts[currentShowcaseIndex];
    if (!product) return;

    showcaseImage.src = product.image;
    showcaseImage.alt = `${product.name} perfume bottle`;
    showcaseCategory.textContent = product.category;
    showcaseName.textContent = product.name;
    showcaseDescription.textContent = product.description;
    showcasePrice.textContent = formatCurrency(product.price); // Assuming formatCurrency is available from cart.js

    // Update data attributes for add to cart button
    addToCartBtn.dataset.id = product.id;
    addToCartBtn.dataset.name = product.name;
    addToCartBtn.dataset.price = product.price;
    addToCartBtn.dataset.image = product.image;
    addToCartBtn.setAttribute('aria-label', `Add ${product.name} to Cart`);

    // Reset add to cart button state
    addToCartBtn.classList.remove('btn--added');
    addToCartBtn.innerHTML = '<i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Add to Cart';
    addToCartBtn.disabled = false;
  };

  prevBtn.addEventListener('click', () => {
    currentShowcaseIndex = (currentShowcaseIndex - 1 + showcaseProducts.length) % showcaseProducts.length;
    updateShowcase();
  });

  nextBtn.addEventListener('click', () => {
    currentShowcaseIndex = (currentShowcaseIndex + 1) % showcaseProducts.length;
    updateShowcase();
  });

  // Initial display
  updateShowcase();

  // Attach add to cart listener for this specific button
  addToCartBtn.addEventListener('click', function () {
    const product = {
      id:    this.dataset.id,
      name:  this.dataset.name,
      price: parseFloat(this.dataset.price),
      image: this.dataset.image
    };

    addToCart(product); // Use the global addToCart from cart.js

    // Button feedback animation
    this.classList.add('btn--added');
    const originalHTML = this.innerHTML;
    this.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Added';
    this.disabled = true;

    setTimeout(() => {
      this.innerHTML = originalHTML;
      this.disabled = false;
      this.classList.remove('btn--added');
    }, 1500);
  });
}

/* ============================================================
   15. INITIALISE ALL MODULES
   ============================================================ */

/**
 * Run everything when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  injectActiveLinkStyle();
  initNavbarScroll();
  initHamburgerMenu();
  initActiveNavLink();
  applyFadeInClasses();
  initScrollAnimations();
  initSmoothScroll();
  initProductImageLinks();
  initBackToTop();
  initImageLoadEffects();
  initProductShowcase(); // Add this new initializer
  initImageLightbox();
  initCardGalleries();
});