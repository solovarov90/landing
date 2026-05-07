/* ============================================================
   SMART POSTING — Bento Landing Page
   JavaScript: Scroll Reveals, Marquee, Lightbox, Nav, Counter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar Scroll ---------- */
  const nav = document.querySelector('.nav');
  const handleNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Scroll Reveal ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Counter Animation ---------- */
  const counters = document.querySelectorAll('.ticker-value[data-target]');
  let countersAnimated = false;

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(target).includes('.');
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current).toLocaleString('ru-RU') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const tickerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(c => animateCounter(c));
        tickerObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const tickerEl = document.querySelector('.hero-ticker');
  if (tickerEl) tickerObserver.observe(tickerEl);

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxClose = document.querySelector('.lightbox-close');

  // Make bento items with images clickable
  document.querySelectorAll('.bento-item[data-lightbox]').forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox;
      const isVideo = src.endsWith('.mp4');

      lightboxContent.innerHTML = '';
      if (isVideo) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '90vw';
        video.style.maxHeight = '90vh';
        video.style.borderRadius = '12px';
        lightboxContent.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Enlarged view';
        lightboxContent.appendChild(img);
      }
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Also make marquee cards clickable
  document.querySelectorAll('.marquee-card[data-lightbox]').forEach(card => {
    card.style.cursor = 'zoom-in';
    card.addEventListener('click', () => {
      const src = card.dataset.lightbox;
      lightboxContent.innerHTML = '';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Review';
      lightboxContent.appendChild(img);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Stop videos
    const vid = lightboxContent.querySelector('video');
    if (vid) vid.pause();
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Video Scroll Play ---------- */
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.2 }); // Lower threshold for faster trigger in sliders

  document.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
  });


  /* ---------- Marquee Endless Drag & Scroll ---------- */
  document.querySelectorAll('.marquee-track').forEach(track => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let isHovering = false;
    let hasDragged = false;
    let speed = track.classList.contains('reverse') ? -0.7 : 0.7;
    
    // Init track positions to ensure seamless start
    const initMarquee = () => {
      if (speed < 0) {
        track.scrollLeft = track.scrollWidth / 2;
      } else {
        track.scrollLeft = 0;
      }
    };
    
    // Run after a small delay to ensure rendering
    setTimeout(initMarquee, 100);
    
    const autoScroll = () => {
      if (!isDown && !isHovering) {
        track.scrollLeft += speed;
        
        // Endless wrap logic
        if (speed > 0) {
          if (track.scrollLeft >= track.scrollWidth / 2) {
            track.scrollLeft = 0;
          }
        } else {
          if (track.scrollLeft <= 0) {
            track.scrollLeft = track.scrollWidth / 2;
          }
        }
      }
      requestAnimationFrame(autoScroll);
    };
    requestAnimationFrame(autoScroll);

    const startDrag = (e) => {
      isDown = true;
      hasDragged = false;
      track.style.cursor = 'grabbing';
      startX = (e.pageX || e.touches[0].pageX) - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      isHovering = true;
    };

    const stopDrag = () => {
      isDown = false;
      track.style.cursor = 'grab';
      isHovering = false;
      // hasDragged reset happens on next mousedown
    };

    const drag = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = (e.pageX || e.touches[0].pageX) - track.offsetLeft;
      const walk = (x - startX) * 2;
      
      if (Math.abs(walk) > 5) hasDragged = true;

      let newScroll = scrollLeft - walk;
      
      // Infinite drag wrap
      if (newScroll >= track.scrollWidth / 2) {
        newScroll -= track.scrollWidth / 2;
        startX = x;
        scrollLeft = newScroll;
      } else if (newScroll <= 0) {
        newScroll += track.scrollWidth / 2;
        startX = x;
        scrollLeft = newScroll;
      }
      track.scrollLeft = newScroll;
    };

    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, {passive: true});
    
    track.addEventListener('mouseleave', stopDrag);
    track.addEventListener('mouseup', stopDrag);
    track.addEventListener('touchend', stopDrag);
    
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', drag, {passive: false});

    track.addEventListener('mouseenter', () => { isHovering = true; });

    // Prevent lightbox if dragged
    track.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });

  /* ---------- Smooth Scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- YouTube Auto-Load & Play on Scroll ---------- */
  const ytObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const placeholder = entry.target;
        const videoId = placeholder.dataset.videoId;
        if (!videoId || placeholder.dataset.loaded) return;

        placeholder.dataset.loaded = "true";
        const iframe = document.createElement('iframe');
        // Switched to youtube.com and added origin param to fix Error 153
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&controls=1&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`);
        iframe.setAttribute('frameborder', '0');

        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allowfullscreen', '1');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.borderRadius = '12px';
        iframe.style.pointerEvents = 'none'; // Keep it non-interactive for smooth scroll

        placeholder.style.padding = '0';
        placeholder.innerHTML = '';
        placeholder.appendChild(iframe);
        
        // Remove text and play icon if they were there
        placeholder.style.background = '#000';
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.yt-placeholder').forEach(p => ytObserver.observe(p));
  
  /* ---------- Mobile Auto-Slider ---------- */
  if (window.innerWidth <= 768) {
    const sliders = document.querySelectorAll('.steps-grid, .case-scroll');
    sliders.forEach(slider => {
      let scrollAmount = 0;
      let scrollStep = 1; // pixels
      let isInteracting = false;
      
      const step = () => {
        if (!isInteracting) {
          slider.scrollLeft += scrollStep;
          // Loop back
          if (slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth - 1)) {
            slider.scrollLeft = 0;
          }
        }
        requestAnimationFrame(step);
      };
      
      // Stop on touch
      slider.addEventListener('touchstart', () => isInteracting = true);
      slider.addEventListener('touchend', () => {
        setTimeout(() => isInteracting = false, 3000); // Resume after 3s
      });
      
      requestAnimationFrame(step);
    });
  }


});
