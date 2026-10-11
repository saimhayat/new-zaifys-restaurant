import { useEffect } from "react";

// Safe wrapper check for setMeta execution
function setMeta(attr, key, content) {
  if (typeof document === "undefined") return;
  
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el && content) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  
  if (el) {
    if (content) {
      el.setAttribute("content", content);
    } else {
      el.remove(); // Safely clean up if the property is updated to empty/null
    }
  }
}

// Safe wrapper check for link manipulations (like canonical URL configuration)
function setLink(rel, href) {
  if (typeof document === "undefined") return;

  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el && href) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }

  if (el) {
    if (href) {
      el.setAttribute("href", href);
    } else {
      el.remove();
    }
  }
}

/**
 * Lightweight SSR-safe SEO manager — sets title, meta description, Open Graph and
 * Twitter card tags without pulling in react-helmet, keeping the bundle small.
 */
function Seo({ title, description, canonicalUrl, ogImage }) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    if (canonicalUrl) {
      setLink("canonical", canonicalUrl);
      setMeta("property", "og:url", canonicalUrl);
    }

    if (ogImage) {
      setMeta("property", "og:image", ogImage);
      setMeta("name", "twitter:image", ogImage);
    }
  }, [title, description, canonicalUrl, ogImage]);

  return null;
}

export default Seo;