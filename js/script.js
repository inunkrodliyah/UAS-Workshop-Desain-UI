document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi AromaEssenceShop
  AromaEssenceShop.init();
});

const AromaEssenceShop = {
  cart: JSON.parse(localStorage.getItem('cart')) || [],

  init: function() {
    this.initGlobalFeatures();
    this.initPageSpecificFeatures();
  },

  initGlobalFeatures: function() {
    this.updateCartCount();
    this.setupHamburgerMenu();
    this.setupNavbarScroll();
    this.setupSmoothScrolling();
    this.setupAllCarousels();
    this.setupForms();
  },

  
  initPageSpecificFeatures: function() {
    const body = document.body;
    if (document.querySelector('.hero')) this.setupIndexPage();
    if (document.querySelector('.product-catalog')) this.setupProductCatalog();
    if (document.querySelector('.product-detail')) this.setupProductDetail();
    if (document.querySelector('.shopping-cart')) this.setupShoppingCart();
    if (document.querySelector('.checkout-process')) this.setupCheckoutProcess();
    if (document.querySelector('.order-history')) this.setupOrderHistory();
    if (document.querySelector('.article-list')) this.setupArticleList();
    if (document.querySelector('.article-detail')) this.setupArticleDetail();
  },

  saveCart: function() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  },

  updateCartCount: function() {
    const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count, .cart-count').forEach(el => {
      el.textContent = cartCount;
    });
  },

  addToCart: function(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!productCard) return;

    const product = {
      id: productId,
      name: productCard.querySelector('h3').textContent,
      price: parseFloat(productCard.dataset.price),
      image: productCard.querySelector('img').src,
      description: productCard.querySelector('.product-description').textContent,
      quantity: 1
    };

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push(product);
    }

    this.saveCart();
    this.updateCartCount();
    alert(`${product.name} telah ditambahkan ke keranjang!`);
  },

  renderCartItems: function() {
    const cartItemsList = document.getElementById('cart-items-list');
    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';
    if (this.cart.length === 0) {
      cartItemsList.innerHTML = '<p>Keranjang Anda kosong.</p>';
      this.updateCartSummary();
      return;
    }

    this.cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('cart-item');
      itemElement.innerHTML = `
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
          <h3><a href="product-detail.html?product=${item.id}">${item.name}</a></h3>
          <p>${item.description}</p>
          <span class="item-price">${item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
          <div class="item-actions">
            <div class="quantity">
              <button class="qty-minus"><i class="fas fa-minus"></i></button>
              <input type="number" value="${item.quantity}" min="1">
              <button class="qty-plus"><i class="fas fa-plus"></i></button>
            </div>
            <a href="#" class="remove-item"><i class="far fa-trash-alt"></i> Hapus</a>
          </div>
        </div>
      `;
      cartItemsList.appendChild(itemElement);
    });

    cartItemsList.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.closest('.cart-item').querySelector('a[href*="product"]').getAttribute('href').split('=')[1];
        this.updateQuantity(itemId, -1);
      });
    });

    cartItemsList.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.closest('.cart-item').querySelector('a[href*="product"]').getAttribute('href').split('=')[1];
        this.updateQuantity(itemId, 1);
      });
    });

    cartItemsList.querySelectorAll('.quantity input').forEach(input => {
      input.addEventListener('change', () => {
        const itemId = input.closest('.cart-item').querySelector('a[href*="product"]').getAttribute('href').split('=')[1];
        this.updateQuantity(itemId, input.value);
      });
    });

    cartItemsList.querySelectorAll('.remove-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = link.closest('.cart-item').querySelector('a[href*="product"]').getAttribute('href').split('=')[1];
        this.removeFromCart(itemId);
      });
    });

    this.updateCartSummary();
  },

  updateQuantity: function(productId, value) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    if (typeof value === 'string') {
      value = parseInt(value);
      if (isNaN(value) || value < 1) value = 1;
    } else {
      value = item.quantity + value;
      if (value < 1) value = 1;
    }

    item.quantity = value;
    this.saveCart();
    this.renderCartItems();
    this.updateCartCount();
  },

  removeFromCart: function(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.renderCartItems();
    this.updateCartCount();
  },

  updateCartSummary: function() {
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const itemsCountEl = document.getElementById('cart-items-count');

    if (!subtotalEl || !taxEl || !totalEl || !itemsCountEl) return;

    const subtotal = this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    itemsCountEl.textContent = `${this.cart.reduce((total, item) => total + item.quantity, 0)} Item di Keranjang Anda`;
    subtotalEl.textContent = subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    taxEl.textContent = tax.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    totalEl.textContent = total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  },

  setupHamburgerMenu: function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
      });

      document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          hamburger.classList.remove('active');
          body.style.overflow = '';
        });
      });
    }
  },

  setupNavbarScroll: function() {
    const handleNavbarScroll = () => {
      const navbar = document.querySelector('nav');
      if (!navbar) return;

      if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      }
    };

    handleNavbarScroll();
    window.addEventListener('scroll', handleNavbarScroll);
  },

  setupSmoothScrolling: function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });

          history.pushState(null, null, targetId);
        }
      });
    });
  },

  setupAllCarousels: function() {
    const carousels = document.querySelectorAll('.quote-carousel, .split-carousel');
    carousels.forEach(carousel => this.setupCarousel(carousel));
  },

  setupCarousel: function(carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.parentElement.querySelector('.prev-btn');
    const nextBtn = carousel.parentElement.querySelector('.next-btn');
    const indicator = carousel.parentElement.querySelector('.carousel-indicator');

    let currentSlide = 0;

    const updateSlide = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });

      if (indicator) {
        indicator.textContent = `${currentSlide + 1}/${slides.length}`;
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlide();
      });
    }

    updateSlide();
  },

  setupForms: function() {
    document.querySelectorAll('.cta-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        if (email && password) {
          localStorage.setItem('newsletterEmail', email);
          alert('Terima kasih telah mendaftar untuk uji coba gratis!');
          form.reset();
        } else {
          alert('Silakan isi email dan kata sandi.');
        }
      });
    });

    document.querySelectorAll('#review-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = form.querySelectorAll('.stars i.active').length;

        if (rating === 0) {
          alert('Silakan pilih rating');
          return;
        }

        alert('Terima kasih atas ulasan Anda!');
        form.reset();
        form.querySelectorAll('.stars i').forEach(star => star.classList.remove('active'));
      });
    });
  },

  setupIndexPage: function() {
    // No specific functionality required for index page yet
  },

  setupProductCatalog: function() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.closest('.product-card').dataset.id;
        this.addToCart(productId);
      });
    });
  },

  setupShoppingCart: function() {
    this.renderCartItems();
  },

  setupProductDetail: function() {},
  setupCheckoutProcess: function() {},
  setupOrderHistory: function() {},
  setupArticleList: function() {},
  setupArticleDetail: function() {}
};

