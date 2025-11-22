
(function() {
  'use strict';

  const CONFIG = {
    scrollThreshold: 300,
    debounceDelay: 300,
    formValidationDebounce: 500,
    successMessageTimeout: 3000,
    animationTimeout: 300
  };

  function isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function safeQuerySelector(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn('Invalid selector:', selector, e);
      return null;
    }
  }

  function safeQuerySelectorAll(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (e) {
      console.warn('Invalid selector:', selector, e);
      return [];
    }
  }

  (function initThemeToggle() {
    try {
      const themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;

      const currentTheme = (isLocalStorageAvailable() && localStorage.getItem('theme')) || 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      updateThemeIcon(currentTheme);

      themeToggle.addEventListener('click', function() {
        try {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          
          document.documentElement.setAttribute('data-theme', newTheme);
          
          if (isLocalStorageAvailable()) {
            localStorage.setItem('theme', newTheme);
          }
          
          updateThemeIcon(newTheme);
        } catch (e) {
          console.error('Error toggling theme:', e);
        }
      });
    } catch (e) {
      console.error('Error initializing theme toggle:', e);
    }

    function updateThemeIcon(theme) {
      try {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i, svg, img');
        if (icon) {
          icon.setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
        }
      } catch (e) {
        console.error('Error updating theme icon:', e);
      }
    }
  })();

  (function initFormValidation() {
    try {
      const forms = safeQuerySelectorAll('form[data-validate]');
      if (forms.length === 0) return;

      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          try {
            if (validateForm(form)) {
              showFormSuccess(form);
              form.reset();
              form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
              form.querySelectorAll('.error-message').forEach(el => el.remove());
            }
          } catch (e) {
            console.error('Error submitting form:', e);
          }
        });
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          input.addEventListener('blur', function() {
            try {
              validateField(input);
            } catch (e) {
              console.error('Error validating field on blur:', e);
            }
          });
          
          const debouncedValidate = debounce(function() {
            try {
              if (input.classList.contains('error')) {
                validateField(input);
              }
            } catch (e) {
              console.error('Error validating field on input:', e);
            }
          }, CONFIG.formValidationDebounce);
          
          input.addEventListener('input', debouncedValidate);
        });
      });
    } catch (e) {
      console.error('Error initializing form validation:', e);
    }

    function validateForm(form) {
      try {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
          if (!validateField(input)) {
            isValid = false;
          }
        });
        
        return isValid;
      } catch (e) {
        console.error('Error validating form:', e);
        return false;
      }
    }

    function validateField(field) {
      try {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';
        
        const existingError = field.parentElement?.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        field.classList.remove('error', 'success');
        
        if (field.hasAttribute('required') && !value) {
          isValid = false;
          errorMessage = 'هذا الحقل مطلوب';
        }
        
        if (type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
          }
        }
        
        if (type === 'tel' && value) {
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(value) || value.length < 10) {
            isValid = false;
            errorMessage = 'يرجى إدخال رقم هاتف صحيح';
          }
        }
        
        if (field.hasAttribute('minlength') && value) {
          const minLength = parseInt(field.getAttribute('minlength'), 10);
          if (!isNaN(minLength) && value.length < minLength) {
            isValid = false;
            errorMessage = `يجب أن يكون النص على الأقل ${minLength} أحرف`;
          }
        }
        
        if (!isValid) {
          field.classList.add('error');
          const errorDiv = document.createElement('span');
          errorDiv.className = 'error-message';
          errorDiv.textContent = errorMessage;
          errorDiv.setAttribute('role', 'alert');
          errorDiv.setAttribute('aria-live', 'polite');
          if (field.parentElement) {
            field.parentElement.appendChild(errorDiv);
          }
        } else if (value) {
          field.classList.add('success');
        }
        
        return isValid;
      } catch (e) {
        console.error('Error validating field:', e);
        return false;
      }
    }

    function showFormSuccess(form) {
      try {
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.setAttribute('role', 'alert');
        successMessage.setAttribute('aria-live', 'polite');
        successMessage.innerHTML = '<strong>تم الإرسال بنجاح!</strong> شكراً لتواصلك معنا.';
        successMessage.style.cssText = 'padding: 16px; background-color: #d4edda; color: #155724; border-radius: 8px; margin-bottom: 24px;';
        
        form.insertBefore(successMessage, form.firstChild);
        
        setTimeout(() => {
          successMessage.style.transition = 'opacity 0.3s';
          successMessage.style.opacity = '0';
          setTimeout(() => successMessage.remove(), CONFIG.animationTimeout);
        }, CONFIG.successMessageTimeout);
      } catch (e) {
        console.error('Error showing form success:', e);
      }
    }
  })();

  (function initSmoothScroll() {
    try {
      const anchors = safeQuerySelectorAll('a[href^="#"]');
      if (anchors.length === 0) return;

      anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          try {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
              e.preventDefault();
              const target = safeQuerySelector(href);
              if (target) {
                target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }
          } catch (e) {
            console.error('Error in smooth scroll:', e);
          }
        });
      });
    } catch (e) {
      console.error('Error initializing smooth scroll:', e);
    }
  })();

  (function initScrollAnimations() {
    try {
      if (!('IntersectionObserver' in window)) {
        safeQuerySelectorAll('.animate-on-scroll').forEach(el => {
          el.classList.add('animate-fade-in');
        });
        return;
      }

      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      safeQuerySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    } catch (e) {
      console.error('Error initializing scroll animations:', e);
    }
  })();

  (function initMobileMenu() {
    try {
      const menuToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');

      if (!menuToggle || !mobileMenu) return;

      menuToggle.addEventListener('click', function() {
        try {
          const isOpen = mobileMenu.classList.contains('show');
          mobileMenu.classList.toggle('show');
          menuToggle.setAttribute('aria-expanded', !isOpen);
          menuToggle.setAttribute('aria-label', isOpen ? 'فتح القائمة' : 'إغلاق القائمة');
        } catch (e) {
          console.error('Error toggling mobile menu:', e);
        }
      });
      
      document.addEventListener('click', function(e) {
        try {
          if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            mobileMenu.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'فتح القائمة');
          }
        } catch (e) {
          console.error('Error handling menu click outside:', e);
        }
      });
    } catch (e) {
      console.error('Error initializing mobile menu:', e);
    }
  })();

  (function initFAQAccordion() {
    try {
      const faqItems = safeQuerySelectorAll('details.faq-item');
      if (faqItems.length === 0) return;

      faqItems.forEach(details => {
        const summary = details.querySelector('summary');
        if (summary) {
          summary.addEventListener('click', function() {
            try {
              details.classList.add('opening');
              setTimeout(() => {
                details.classList.remove('opening');
              }, CONFIG.animationTimeout);
            } catch (e) {
              console.error('Error handling FAQ click:', e);
            }
          });
        }
      });
    } catch (e) {
      console.error('Error initializing FAQ accordion:', e);
    }
  })();

  (function initLazyLoading() {
    try {
      if (!('IntersectionObserver' in window)) {
        safeQuerySelectorAll('img[data-src]').forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
        });
        return;
      }

      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      safeQuerySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } catch (e) {
      console.error('Error initializing lazy loading:', e);
    }
  })();

  (function initScrollToTop() {
    try {
      const scrollTopBtn = document.getElementById('scroll-top');
      if (!scrollTopBtn) return;

      const handleScroll = debounce(function() {
        try {
          if (window.pageYOffset > CONFIG.scrollThreshold) {
            scrollTopBtn.classList.add('show');
          } else {
            scrollTopBtn.classList.remove('show');
          }
        } catch (e) {
          console.error('Error handling scroll:', e);
        }
      }, 100);

      window.addEventListener('scroll', handleScroll);
      
      scrollTopBtn.addEventListener('click', function() {
        try {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } catch (e) {
          console.error('Error scrolling to top:', e);
          window.scrollTo(0, 0);
        }
      });
    } catch (e) {
      console.error('Error initializing scroll to top:', e);
    }
  })();

  (function initQuickDonate() {
    try {
      const quickDonateBtn = document.querySelector('.quick-donate-button');
      if (!quickDonateBtn) return;

      quickDonateBtn.addEventListener('click', function() {
        try {
          const donateSection = safeQuerySelector('#donate') || safeQuerySelector('a[href="#donate"]');
          if (donateSection) {
            if (donateSection.tagName === 'A') {
              donateSection.click();
            } else {
              donateSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
        } catch (e) {
          console.error('Error handling quick donate:', e);
        }
      });
    } catch (e) {
      console.error('Error initializing quick donate:', e);
    }
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
    });
  }
})();
