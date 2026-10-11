import "./ThemeToggle.css";

function ThemeToggle({ className = "" }) {
  const toggle = () => {
    const current =
      document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", current);
    try {
      localStorage.setItem("theme", current);
    } catch {
      /* private mode — ignore */
    }
  };

  // CSS renders the correct icon per theme; keep the DOM single-button for simplicity.
  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label="Toggle dark and light theme"
      title="Toggle theme"
    >
      <svg className="theme-toggle__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.4 14.2A8.8 8.8 0 1 1 9.8 3.6a7 7 0 1 0 10.6 10.6Z" />
      </svg>
      <svg className="theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
      </svg>
    </button>
  );
}

export default ThemeToggle;