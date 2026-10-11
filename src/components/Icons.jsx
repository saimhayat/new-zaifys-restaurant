// Professional icon set via lucide-react. Every legacy export name is kept so
// existing components keep working; each is a thin wrapper with consistent
// stroke width and a shared default size. New icons can be imported directly
// from lucide-react in feature components.

import {
  Leaf,
  ChefHat,
  Star,
  Lamp,
  Users,
  Clock,
  ShieldCheck,
  Heart,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  Quote,
} from "lucide-react";

const base = {
  width: 24,
  height: 24,
  strokeWidth: 1.75,
  "aria-hidden": true,
};

export function LeafIcon(props) {
  return <Leaf {...base} {...props} />;
}

export function ChefIcon(props) {
  return <ChefHat {...base} {...props} />;
}

export function StarIcon({ filled, ...props }) {
  return (
    <Star
      {...base}
      fill={filled ? "currentColor" : "none"}
      {...props}
    />
  );
}

export function LampIcon(props) {
  return <Lamp {...base} {...props} />;
}

export function FamilyIcon(props) {
  return <Users {...base} {...props} />;
}

export function ClockIcon(props) {
  return <Clock {...base} {...props} />;
}

export function ShieldIcon(props) {
  return <ShieldCheck {...base} {...props} />;
}

export function HeartIcon(props) {
  return <Heart {...base} {...props} />;
}

export function PhoneIcon(props) {
  return <Phone {...base} {...props} />;
}

export function PinIcon(props) {
  return <MapPin {...base} {...props} />;
}

export function MenuIcon(props) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowDownIcon(props) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 4v15M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuoteIcon(props) {
  return <Quote {...base} fill="currentColor" strokeWidth={0} {...props} />;
}

export function ChevronIcon(props) {
  return <ChevronRight {...base} {...props} />;
}

export function ChevronDownIcon(props) {
  return <ChevronDown {...base} {...props} />;
}

// Brand glyphs are no longer shipped with lucide; these match its stroke style.
export function FacebookIcon(props) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M14 8.5h2.5V5H14c-2 0-3.5 1.6-3.5 3.6V11H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5h-3V9c0-.3.3-1 1-1Z" strokeWidth={1.75} strokeLinejoin="round" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth={1.75} />
      <circle cx="12" cy="12" r="4" strokeWidth={1.75} />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon(props) {
  // lucide has no WhatsApp glyph; keep the hand-drawn one, restyled to match
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 18.5 4.8 21.5 8 20.3A8.5 8.5 0 1 0 6 18.5Z" />
      <path d="M9 9.3c0 3 2.7 5.7 5.7 5.7.6 0 .9-.5.7-1l-.6-1.4a.8.8 0 0 0-.9-.4l-1 .3a5 5 0 0 1-2.4-2.4l.3-1a.8.8 0 0 0-.4-.9L9.4 7.6c-.5-.2-1 .1-1 .7 0 .4.3.7.6 1Z" />
    </svg>
  );
}

const ICONS = {
  leaf: LeafIcon,
  chef: ChefIcon,
  star: StarIcon,
  lamp: LampIcon,
  family: FamilyIcon,
  clock: ClockIcon,
  shield: ShieldIcon,
  heart: HeartIcon,
};

export function FeatureIcon({ name, ...props }) {
  const Icon = ICONS[name] || StarIcon;
  return <Icon {...props} />;
}
