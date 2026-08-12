document.documentElement.classList.add('js');
const items = document.querySelectorAll('.case-section, .case-cover-wrap, .feature-grid article, .screen-grid figure');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('case-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => { item.classList.add('case-reveal'); observer.observe(item); });
}
