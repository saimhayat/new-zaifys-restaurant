import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { scrollToSection } from "./utils/scrollTo";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import NotFound from "./pages/NotFound";

/**
 * The admin panel is code-split so customers never download it — it only
 * arrives when someone actually visits /admin.
 */
const AdminApp = lazy(() => import("./admin/AdminApp"));

function AdminFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "var(--color-text-muted)",
        fontSize: "0.9rem",
      }}
    >
      Loading admin panel…
    </div>
  );
}

function RouteScroll() {
  const location = useLocation(), navigationType = useNavigationType();
  const positions = useRef(new Map()), previousPath = useRef(null);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);
  useEffect(() => {
    const { key, pathname, hash } = location;
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;
    let ready = false;
    const record = () => {
      if (ready && document.body.style.position !== "fixed") positions.current.set(key, window.scrollY);
    };
    const frame = requestAnimationFrame(() => {
      const saved = positions.current.get(key);
      if (navigationType === "POP" && saved !== undefined) {
        window.scrollTo({ top: saved, left: 0, behavior: "instant" });
      } else {
        let id;
        try { id = decodeURIComponent(hash.slice(1)); } catch { id = ""; }
        if (!id || !scrollToSection(id, { behavior: samePage && navigationType !== "POP" ? "smooth" : "instant" })) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }
      ready = true;
      record();
    });
    window.addEventListener("scroll", record, { passive: true });
    return () => { cancelAnimationFrame(frame); record(); window.removeEventListener("scroll", record); };
  }, [location, navigationType]);
  return null;
}

function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <>
        <RouteScroll />
        <div className={`app-root${pathname === "/" ? " app-root--home" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<><Navbar /><CartPage /></>} />
            <Route path="/checkout" element={<><Navbar /><CheckoutPage /></>} />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminApp />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
    </>
  );
}

function App() {
  return <CartProvider><BrowserRouter><AppRoutes /></BrowserRouter></CartProvider>;
}

export default App;
