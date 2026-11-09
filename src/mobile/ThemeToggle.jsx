/* Sun / Moon theme toggle — fixed top-right of the mobile header.
   Both icons are rendered and crossfaded purely in CSS based on the
   ancestor <html data-theme>, giving a smooth rotate+fade with no JS. */

const SunIcon = () => (
  <svg className="m-ticon m-ticon--sun" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.2v2.4M12 19.4v2.4M4.2 12H1.8M22.2 12h-2.4M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
  </svg>
);

const MoonIcon = () => (
  <svg className="m-ticon m-ticon--moon" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
  </svg>
);

const ThemeToggle = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="m-theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {/* Sun shows in dark mode (tap → light); Moon shows in light mode. */}
      <SunIcon />
      <MoonIcon />
    </button>
  );
};

export default ThemeToggle;
