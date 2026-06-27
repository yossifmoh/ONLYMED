// ================== ONLYMED THEME ENGINE ==================
// Shared across Storefront (index.html) and Admin Dashboard (admin.html)

(function () {
  const STORAGE_KEY = 'onlymed_theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }
    return LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icons = document.querySelectorAll('#themeIcon, #adminThemeIcon');
    icons.forEach(icon => {
      icon.className = theme === DARK ? 'fa fa-sun' : 'fa fa-moon';
    });
    syncChartTheme(theme);
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  function syncChartTheme(theme) {
    if (typeof Chart === 'undefined') return;
    const isDark = theme === DARK;
    Chart.defaults.color = isDark ? '#94a3b8' : '#6b7280';
    Chart.defaults.borderColor = isDark ? '#2d3148' : '#e5e7eb';
    Object.values(Chart.instances || {}).forEach(chart => {
      try { if (chart && chart.update) chart.update(); } catch (e) {}
    });
  }

  // Apply immediately to prevent flash
  const initialTheme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(initialTheme);
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }
})();
