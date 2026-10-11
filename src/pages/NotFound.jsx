import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found">
      <Seo title="Page Not Found | Zaify's Restaurant" description="This page could not be found." />
      <p className="not-found__eyebrow">404</p>
      <h1>This table isn&rsquo;t set.</h1>
      <p>The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back to the menu.</p>
      <Link to="/" className="btn btn-gold">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
