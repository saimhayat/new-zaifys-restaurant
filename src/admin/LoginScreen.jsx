import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { DEMO_PASSCODE, signIn } from "../store/restaurantStore";

/**
 * The sign-in screen.
 *
 * ⚠️ This is a UI gate, not security. The passcode is compared in the browser
 * and is sitting in the bundle in plain text — anyone can read it. It exists so
 * the panel has a real sign-in flow to design around. Replace it with server
 * authentication before this is ever reachable from the internet.
 */
function LoginScreen() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!signIn(passcode)) {
      setError("That passcode doesn't match. Try the demo one below.");
      return;
    }
    setError("");
  };

  return (
    <div className="admin admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-brand__mark">Z</span>
          <div className="admin-brand__text">
            <strong>Zaify&rsquo;s</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <h1>Sign in</h1>
        <p>Manage orders, reservations and the menu.</p>

        <form onSubmit={handleSubmit}>
          <label className="admin-field">
            <span className="admin-field__label">Passcode</span>
            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
            />
          </label>

          <button type="submit" className="admin-btn admin-btn--primary admin-btn--block">
            <LockKeyhole size={16} strokeWidth={2} />
            Enter dashboard
          </button>

          {error && (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          )}
        </form>

        <p className="admin-login__hint">
          <strong>Demo gate only.</strong> There is no server, so nothing here is
          secure — the passcode below is public in the bundle. Real
          authentication arrives with the backend.
          <br />
          Passcode: <code>{DEMO_PASSCODE}</code>
        </p>

        <Link to="/" className="admin-btn admin-btn--ghost admin-btn--block" style={{ marginTop: "1rem" }}>
          <ArrowLeft size={15} strokeWidth={2} />
          Back to the website
        </Link>
      </div>
    </div>
  );
}

export default LoginScreen;
