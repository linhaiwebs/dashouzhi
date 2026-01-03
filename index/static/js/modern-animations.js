class ModernAnimations {
  constructor() {
    this.gsapLoaded = false;
    this.initGSAP();
  }

  initGSAP() {
    if (typeof gsap !== 'undefined') {
      this.gsapLoaded = true;
      console.log('GSAP loaded successfully');
    } else {
      console.warn('GSAP not loaded, falling back to CSS animations');
    }
  }

  animateProgressBars(callback) {
    const bars = [
      { selector: '.charts', color: '#FFD54F', label: '市場分析' },
      { selector: '.charts1', color: '#FF7F50', label: 'チャート分析' },
      { selector: '.charts2', color: '#87CEFA', label: 'ニュース分析' }
    ];

    if (this.gsapLoaded) {
      const tl = gsap.timeline({
        onComplete: callback
      });

      bars.forEach((bar, index) => {
        tl.to(bar.selector, {
          width: '100%',
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => {
            $(bar.selector).css('background', `linear-gradient(90deg, ${bar.color}, ${this.darkenColor(bar.color, 20)})`);
          }
        }, index * 0.8);
      });

      return tl;
    } else {
      bars.forEach((bar, index) => {
        setTimeout(() => {
          $(bar.selector).animate({ width: '100%' }, 800, () => {
            if (index === bars.length - 1 && callback) {
              callback();
            }
          });
        }, index * 800);
      });
    }
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  showDialog(dialogSelector) {
    const $dialog = $(dialogSelector);
    $dialog.css('display', 'block');

    if (this.gsapLoaded) {
      gsap.fromTo(dialogSelector,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      $dialog.addClass('animated fadeInUp');
    }
  }

  hideDialog(dialogSelector, callback) {
    if (this.gsapLoaded) {
      gsap.to(dialogSelector, {
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          $(dialogSelector).css('display', 'none');
          if (callback) callback();
        }
      });
    } else {
      $(dialogSelector).addClass('animated fadeOutDown');
      setTimeout(() => {
        $(dialogSelector).removeClass('animated fadeOutDown').css('display', 'none');
        if (callback) callback();
      }, 300);
    }
  }

  animateCounter(element, start, end, duration) {
    if (this.gsapLoaded) {
      const obj = { value: start };
      gsap.to(obj, {
        value: end,
        duration: duration / 1000,
        ease: 'power1.out',
        onUpdate: () => {
          $(element).text(Math.round(obj.value));
        }
      });
    } else {
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        $(element).text(Math.round(current));
      }, 16);
    }
  }

  pulseElement(selector) {
    if (this.gsapLoaded) {
      gsap.to(selector, {
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut'
      });
    } else {
      $(selector).addClass('pulse animated infinite');
    }
  }

  scrollTable(tableSelector, rowHeight, interval) {
    const $table = $(tableSelector);
    const $rows = $table.find('tr');
    const totalRows = $rows.length;
    let currentIndex = 0;

    $table.append($rows.clone());

    setInterval(() => {
      currentIndex++;

      if (this.gsapLoaded) {
        gsap.to(tableSelector, {
          marginTop: -rowHeight * currentIndex,
          duration: 0.7,
          ease: 'power2.inOut',
          onComplete: () => {
            if (currentIndex >= totalRows) {
              gsap.set(tableSelector, { marginTop: 0 });
              currentIndex = 0;
            }
          }
        });
      } else {
        $table.css('transition', 'margin-top 0.7s');
        $table.css('margin-top', -rowHeight * currentIndex);

        if (currentIndex >= totalRows) {
          setTimeout(() => {
            $table.css('transition', 'none');
            $table.css('margin-top', 0);
            currentIndex = 0;
            setTimeout(() => {
              $table.css('transition', 'margin-top 0.7s');
            }, 50);
          }, 700);
        }
      }
    }, interval);
  }

  addHoverEffect(selector) {
    $(selector).hover(
      function() {
        if (typeof gsap !== 'undefined') {
          gsap.to(this, { scale: 1.05, duration: 0.3, ease: 'back.out(1.7)' });
        } else {
          $(this).css('transform', 'scale(1.05)');
        }
      },
      function() {
        if (typeof gsap !== 'undefined') {
          gsap.to(this, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
        } else {
          $(this).css('transform', 'scale(1)');
        }
      }
    );
  }

  createRippleEffect(buttonSelector) {
    $(buttonSelector).on('click', function(e) {
      const $button = $(this);
      const $ripple = $('<span class="ripple"></span>');

      const diameter = Math.max($button.outerWidth(), $button.outerHeight());
      const radius = diameter / 2;

      const offset = $button.offset();
      const x = e.pageX - offset.left - radius;
      const y = e.pageY - offset.top - radius;

      $ripple.css({
        width: diameter,
        height: diameter,
        left: x,
        top: y
      });

      $button.append($ripple);

      setTimeout(() => {
        $ripple.remove();
      }, 600);
    });
  }

  initParallax(selector, speed = 0.5) {
    $(window).on('scroll', function() {
      const scrolled = $(window).scrollTop();
      $(selector).css('transform', `translateY(${scrolled * speed}px)`);
    });
  }

  animateOnScroll(selector, animationClass = 'fadeInUp') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (typeof gsap !== 'undefined') {
            gsap.from(entry.target, {
              opacity: 0,
              y: 50,
              duration: 0.6,
              ease: 'power2.out'
            });
          } else {
            $(entry.target).addClass(`animated ${animationClass}`);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    $(selector).each(function() {
      observer.observe(this);
    });
  }
}

const animations = new ModernAnimations();

window.animations = animations;
