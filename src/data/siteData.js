export const testimonials = [
  {
    id: 1,
    name: "Ayesha Malik",
    role: "Google Review",
    rating: 5,
    quote:
      "Ambience felt like a proper hotel restaurant, not a Satellite Town spot. The Chicken Karahi tasted like it was made for a wedding, not a weeknight.",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    role: "Google Review",
    rating: 5,
    quote:
      "Genuinely a hidden gem. Staff remembered our order preferences from last visit, and the hygiene standards are visibly higher than most places nearby.",
  },
  {
    id: 3,
    name: "Sana Tariq",
    role: "Google Review",
    rating: 4,
    quote:
      "Took the whole family for a Sunday dinner — kids loved the fries, we loved the BBQ platter. Great value for a fine-dining feel.",
  },
  {
    id: 4,
    name: "Hamza Raza",
    role: "Google Review",
    rating: 5,
    quote:
      "The Moroccan Steak surprised me — cooked exactly to order, proper rest time, real char. Didn't expect that quality in this price range.",
  },
  {
    id: 5,
    name: "Fatima Iqbal",
    role: "Google Review",
    rating: 5,
    quote:
      "Their Chinese section is underrated — Singapore Chowmein was better than most dedicated Chinese restaurants I've tried in Rawalpindi.",
  },
  {
    id: 6,
    name: "Usman Sheikh",
    role: "Google Review",
    rating: 4,
    quote:
      "Friendly staff, fast service even on a busy Friday night. Interior lighting makes it a good spot for family photos too.",
  },
];

export const galleryImages = [
  {
    id: 1,
    alt: "Elegant dark dining hall with warm pendant lighting at Zaify's Restaurant",
    category: "Interior",
    src: "/images/photo-1517248135467-4c7edcad34c4.webp",
  },
  {
    id: 2,
    alt: "Chicken karahi served in traditional wok",
    category: "Pakistani",
    src: "/images/photo-1631452180519-c014fe946bc7.webp",
  },
  {
    id: 3,
    alt: "Family enjoying dinner together at a restaurant table",
    category: "Family",
    src: "/images/photo-1529543544282-ea669407fca3.webp",
  },
  {
    id: 4,
    alt: "Skewers of seekh kabab grilling over open coals",
    category: "BBQ",
    src: "/images/photo-1555939594-58d7cb561ad1.webp",
  },
  {
    id: 5,
    alt: "Wok-tossed Chinese noodles with vegetables",
    category: "Chinese",
    src: "/images/photo-1585032226651-759b368d7246.webp",
  },
  {
    id: 6,
    alt: "Seared steak resting on a wooden board",
    category: "Steaks",
    src: "/images/photo-1600891964092-4316c288032e.webp",
  },
  {
    id: 7,
    alt: "Chocolate lava cake with molten centre and ice cream",
    category: "Desserts",
    src: "/images/photo-1624353365286-3f8d62daad51.webp",
  },
  {
    id: 8,
    alt: "Fresh fruit juices and shakes lined up on a marble counter",
    category: "Drinks",
    src: "/images/photo-1622597467836-f3285f2131b8.webp",
  },
  {
    id: 9,
    alt: "Professional chef plating a dish in the kitchen",
    category: "Chefs",
    src: "/images/photo-1577219491135-ce391730fb2c.webp",
  },
];

/**
 * Hero slideshow reel.
 *
 * Swap a photo by changing one `src` line — nothing else needs to move. Each
 * entry carries its own `focus` (object-position) so the interesting part of
 * the frame survives the wide desktop crop and the tall phone crop
 * (`focusMobile` overrides it under 768px). `label` is read out to screen
 * readers from the picker dots.
 */
export const heroSlides = [
  {
    id: 1,
    label: "Our dining hall",
    src: "/images/photo-1517248135467-4c7edcad34c4.webp",
    focus: "center 55%",
  },
  {
    id: 2,
    label: "Coal-fired seekh kabab",
    src: "/images/photo-1555939594-58d7cb561ad1.webp",
    focus: "center 45%",
    focusMobile: "62% 50%",
  },
  {
    id: 3,
    label: "Chicken karahi in the wok",
    src: "/images/photo-1631452180519-c014fe946bc7.webp",
    focus: "center 50%",
  },
  {
    id: 4,
    label: "Hand-cut steak",
    src: "/images/photo-1600891964092-4316c288032e.webp",
    focus: "center 55%",
    focusMobile: "40% 55%",
  },
  {
    id: 5,
    label: "Wok-tossed Chinese",
    src: "/images/photo-1585032226651-759b368d7246.webp",
    focus: "center 50%",
  },
];

export const galleryFilters = [
  "All",
  "Interior",
  "Pakistani",
  "BBQ",
  "Chinese",
  "Steaks",
  "Desserts",
  "Drinks",
  "Family",
  "Chefs",
];

export const stats = [
  { id: 1, value: 673, suffix: "+", label: "Happy Reviews" },
  { id: 2, value: 4.3, suffix: "★", label: "Google Rating", isDecimal: true },
  { id: 3, value: 100, suffix: "+", label: "Signature Dishes" },
  { id: 4, value: 1000, suffix: "+", label: "Happy Customers" },
];

export const features = [
  {
    id: 1,
    title: "Fresh Ingredients",
    description: "Sourced daily from trusted local markets, never held over.",
    icon: "leaf",
  },
  {
    id: 2,
    title: "Expert Chefs",
    description: "Seasoned hands trained across Pakistani, Chinese and continental kitchens.",
    icon: "chef",
  },
  {
    id: 3,
    title: "Premium Taste",
    description: "Every recipe balanced and tested before it reaches your table.",
    icon: "star",
  },
  {
    id: 4,
    title: "Luxury Ambience",
    description: "Warm lighting, comfortable seating, and a room that feels occasion-worthy.",
    icon: "lamp",
  },
  {
    id: 5,
    title: "Family Friendly",
    description: "Spacious seating and a menu that works for every generation at the table.",
    icon: "family",
  },
  {
    id: 6,
    title: "Fast Service",
    description: "Attentive staff and a kitchen built to keep pace without cutting corners.",
    icon: "clock",
  },
  {
    id: 7,
    title: "Excellent Hygiene",
    description: "Rigorous kitchen standards, visible cleanliness, every single service.",
    icon: "shield",
  },
  {
    id: 8,
    title: "Friendly Staff",
    description: "A team that remembers regulars and treats first-timers the same way.",
    icon: "heart",
  },
];

export const restaurantInfo = {
  name: "Zaify's Restaurant",
  tagline: "Where Every Meal Becomes a Memory.",
  address: "57-B, Block B, Commercial Market, Satellite Town, Rawalpindi, Pakistan",
  phone: "+92 300 6165529",
  phoneHref: "+923006165529",
  whatsappHref: "923006165529",
  rating: 4.3,
  reviews: 673,
  priceRange: "Rs. 1000 – 2000",
  hours: [
    { day: "Monday – Thursday", time: "12:00 PM – 11:30 PM" },
    { day: "Friday", time: "1:00 PM – 12:30 AM" },
    { day: "Saturday – Sunday", time: "12:00 PM – 12:30 AM" },
  ],
  services: ["Dine In", "Takeaway", "No Contact Delivery"],
};

export const faqs = [
  {
    id: 1,
    question: "Do you take reservations?",
    answer:
      "Yes — book through the reservation form on this page or call us directly. Weekend evenings fill quickly, so we recommend reserving at least a day ahead for parties of 4 or more.",
  },
  {
    id: 2,
    question: "Do you offer delivery?",
    answer:
      "We offer no-contact delivery across Satellite Town and nearby areas, plus takeaway. Call or WhatsApp us to place a delivery order.",
  },
  {
    id: 3,
    question: "Are halal options available?",
    answer:
      "All of our meat is 100% halal-certified, sourced fresh every morning from trusted suppliers.",
  },
  {
    id: 4,
    question: "Can you host events or large parties?",
    answer:
      "Absolutely. Family gatherings, birthdays and corporate dinners are our specialty — call us and we'll arrange seating, a set menu, and a cake at no extra cutting charge.",
  },
  {
    id: 5,
    question: "Is there parking available?",
    answer:
      "Yes, street parking is available around Commercial Market, and our staff can help guide you to the closest spot during busy hours.",
  },
  {
    id: 6,
    question: "Do you have vegetarian and kids' options?",
    answer:
      "Yes — the menu includes vegetarian Chinese and continental dishes, plus a dedicated kids' section with mild spice levels.",
  },
];

/**
 * Live open/closed status from the weekly hours above.
 * Returns { isOpen, message } computed at render time.
 */
export function getOpenStatus(now = new Date()) {
  // Convert current time to minutes since midnight in PKT (UTC+5)
  const pkt = new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60000);
  const day = pkt.getDay(); // 0 = Sunday
  const mins = pkt.getHours() * 60 + pkt.getMinutes();

  const parse = (label, clock) => {
    const m = clock.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return 0;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === "PM") h += 12;
    return h * 60 + Number(m[2]);
  };

  // Hours table by weekday (0=Sun … 6=Sat), matching restaurantInfo.hours
  const open = 12 * 60; // 12:00 PM default open
  let close;
  if (day === 5) close = parse("close", "12:30 AM") + 24 * 60; // Fri → past midnight
  else if (day === 6 || day === 0) close = parse("close", "12:30 AM") + 24 * 60; // Sat/Sun
  else close = parse("close", "11:30 PM");

  const isOpen = mins >= open && mins <= close;
  return {
    isOpen,
    message: isOpen ? "Open Now" : "Closed — Opens 12:00 PM",
  };
}
