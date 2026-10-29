/**
 * Ali - Personal Portfolio
 * Arter Dashboard Engine (Plain TypeScript)
 */

import './index.css';

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initNavigation();
  initReservationDemo();
  initContactActions();
  initThemeToggle();
  // Ensure fresh display of original photo
  try {
    localStorage.removeItem('ali_portfolio_avatar');
  } catch {}
});

/**
 * 1. Intersection Observer for Scroll Fade-In Effects
 */
function initScrollAnimations(): void {
  const animatedElements = document.querySelectorAll<HTMLElement>('.fade-in-section');

  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

/**
 * 2. Navigation & Arter Rails
 */
function initNavigation(): void {
  const railMenuBtn = document.getElementById('rail-menu-btn');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerLinks = document.querySelectorAll<HTMLAnchorElement>('.drawer-link');
  const railActiveSection = document.getElementById('rail-active-section');
  const sections = document.querySelectorAll<HTMLElement>('section[id]');

  // Mobile Toggles
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileProfileToggle = document.getElementById('mobile-profile-toggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle navigation drawer on desktop rail
  const toggleDrawer = () => {
    navDrawer?.classList.toggle('open');
  };

  railMenuBtn?.addEventListener('click', toggleDrawer);
  mobileMenuToggle?.addEventListener('click', toggleDrawer);

  // Toggle profile sidebar on mobile
  mobileProfileToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
  });

  // Close drawer and mobile sidebar on link click
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navDrawer?.classList.remove('open');
      sidebar?.classList.remove('mobile-open');
    });
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (
      navDrawer?.classList.contains('open') &&
      !navDrawer.contains(target) &&
      !railMenuBtn?.contains(target) &&
      !mobileMenuToggle?.contains(target)
    ) {
      navDrawer.classList.remove('open');
    }
  });

  // Active section tracking (ScrollSpy)
  const mainContent = document.getElementById('main-content') || window;

  const handleScroll = () => {
    const scrollPos = (mainContent === window ? window.scrollY : (mainContent as HTMLElement).scrollTop) + 180;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        drawerLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        if (railActiveSection && sectionId) {
          railActiveSection.textContent = sectionId.toUpperCase();
        }
      }
    });
  };

  mainContent.addEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleScroll);
}



/**
 * 4. Interactive Prototype for "Online Reservation App"
 */
function initReservationDemo(): void {
  const serviceSelect = document.getElementById('demo-service') as HTMLSelectElement | null;
  const dateInput = document.getElementById('demo-date') as HTMLInputElement | null;
  const slotButtons = document.querySelectorAll<HTMLButtonElement>('.sim-slot-btn');
  const summaryBox = document.getElementById('demo-summary');
  const confirmBtn = document.getElementById('confirm-booking-btn');

  // Pre-fill date input with tomorrow's date
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  let selectedService = serviceSelect?.value || 'Appointment Reservation';
  let selectedDate = dateInput?.value || 'Tomorrow';
  let selectedSlot = '09:00 AM';

  const updateSummary = () => {
    if (summaryBox) {
      summaryBox.innerHTML = `Booking: <strong>${escapeHtml(selectedService)}</strong> on <span>${escapeHtml(selectedDate)}</span> at <span>${escapeHtml(selectedSlot)}</span>`;
    }
  };

  serviceSelect?.addEventListener('change', () => {
    selectedService = serviceSelect.value;
    updateSummary();
  });

  dateInput?.addEventListener('change', () => {
    selectedDate = dateInput.value || 'Selected Date';
    updateSummary();
  });

  slotButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      slotButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSlot = btn.getAttribute('data-time') || '09:00 AM';
      updateSummary();
    });
  });

  confirmBtn?.addEventListener('click', () => {
    showToast(`Reservation Confirmed for ${selectedService} at ${selectedSlot}!`);
    confirmBtn.textContent = 'Confirmed!';
    confirmBtn.style.backgroundColor = '#16a34a';
    confirmBtn.style.color = '#ffffff';

    setTimeout(() => {
      confirmBtn.textContent = 'Confirm Slot';
      confirmBtn.style.backgroundColor = '';
      confirmBtn.style.color = '';
    }, 3000);
  });
}

/**
 * 5. Contact Actions: Copy Email & Mailto Composer
 */
function initContactActions(): void {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('user-email-text');
  const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;

  copyBtn?.addEventListener('click', () => {
    const email = emailText?.textContent?.trim() || 'mouhamedaliboubaker9@gmail.com';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email address copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(email);
      });
    } else {
      fallbackCopyText(email);
    }
  });

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('sender-name') as HTMLInputElement | null;
    const subjectInput = document.getElementById('sender-subject') as HTMLInputElement | null;
    const bodyInput = document.getElementById('sender-body') as HTMLTextAreaElement | null;

    const name = nameInput?.value.trim() || 'Visitor';
    const subject = subjectInput?.value.trim() || 'Portfolio Inquiry';
    const body = bodyInput?.value.trim() || '';

    const fullSubject = encodeURIComponent(`[Portfolio] ${subject} from ${name}`);
    const fullBody = encodeURIComponent(`${body}\n\nFrom: ${name}`);

    showToast('Opening your email client to message Ali...');

    setTimeout(() => {
      window.location.href = `mailto:mouhamedaliboubaker9@gmail.com?subject=${fullSubject}&body=${fullBody}`;
    }, 400);
  });
}

/**
 * 6. Theme Accent Switcher (Arter Amber Gold vs Royal Blue)
 */
function initThemeToggle(): void {
  const themeBtn = document.getElementById('theme-toggle-btn');
  let isBlue = false;

  themeBtn?.addEventListener('click', () => {
    isBlue = !isBlue;
    const root = document.documentElement;

    if (isBlue) {
      root.style.setProperty('--accent-color', '#3b82f6');
      root.style.setProperty('--accent-hover', '#2563eb');
      root.style.setProperty('--accent-text', '#ffffff');
      root.style.setProperty('--accent-glow', 'rgba(59, 130, 246, 0.3)');
      showToast('Accent theme switched to Royal Blue!');
    } else {
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-text');
      root.style.removeProperty('--accent-glow');
      showToast('Accent theme switched to Arter Gold!');
    }
  });
}

/**
 * Toast Notification Helper
 */
function showToast(message: string): void {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  if (toast && toastText) {
    toastText.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/**
 * Fallback copy
 */
function fallbackCopyText(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showToast('Email address copied to clipboard!');
  } catch {
    showToast('mouhamedaliboubaker9@gmail.com');
  }

  document.body.removeChild(textArea);
}

/**
 * HTML escape helper
 */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
