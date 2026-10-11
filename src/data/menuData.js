/**
 * Menu data — structured and display-agnostic.
 *
 * Every item shares one shape so no UI code ever has to parse a string:
 *
 *   id           stable slug, also used as the cart line key
 *   name         display name
 *   category     must match an entry in `menuCategories`
 *   description  short menu blurb
 *   image        remote photo URL
 *   sizes        [{ label, price }] in rupees as numbers. The FIRST entry is the
 *                default selection and the price the menu card advertises.
 *                Curries use Half/Full, steaks use weight, drinks use glass size.
 *   tags         short attribute chips (dietary / technique) shown on the card
 *                and in the order modal
 *   spice        default heat level, or null for drinks & desserts — a null
 *                here hides the Spice Level control entirely
 *   prepTime     minutes from order to pass
 *   available    false renders a Sold Out state and blocks ordering
 *   rating       per-dish average out of 5
 *   reviewCount  how many reviews that average is drawn from
 *   badge        optional marketing flag, or null
 *
 * Ratings and review counts are per-dish. They are independent of the
 * restaurant-wide Google total in `restaurantInfo`.
 */

export const menuCategories = [
  "All",
  "Pakistani",
  "BBQ",
  "Chinese",
  "Steaks",
  "Soups",
  "Fast Food",
  "Desserts",
  "Drinks",
];

export const menuItems = [
  {
    id: "malai-boti",
    name: "Malai Boti",
    category: "BBQ",
    description:
      "Tender chicken chunks marinated in cream, garlic and green chilli, char-grilled over coals.",
    image:
      "/images/photo-1633945274405-b6c8069047b0.webp",
    sizes: [
      { label: "Full", price: 890 },
      { label: "Half", price: 550 },
    ],
    tags: ["Char-Grilled", "Contains Dairy"],
    spice: "Medium",
    prepTime: 25,
    available: true,
    rating: 4.7,
    reviewCount: 218,
    badge: "Bestseller",
  },
  {
    id: "chicken-karahi",
    name: "Chicken Karahi",
    category: "Pakistani",
    description:
      "A Zaify's signature — tomato and ginger reduction, hand-pounded spice, finished in a hot wok karahi.",
    image:
      "/images/photo-1631452180519-c014fe946bc7.webp",
    sizes: [
      { label: "Full", price: 1650 },
      { label: "Half", price: 1050 },
    ],
    tags: ["Signature", "Contains Dairy"],
    spice: "Hot",
    prepTime: 30,
    available: true,
    rating: 4.8,
    reviewCount: 342,
    badge: "Chef's Pick",
  },
  {
    id: "mutton-karahi",
    name: "Mutton Karahi",
    category: "Pakistani",
    description:
      "Slow-cooked mutton in a rich desi-ghee tomato base, layered with green chillies and coriander.",
    image:
      "/images/photo-1585937421612-70a008356fbe.webp",
    sizes: [
      { label: "Full", price: 2450 },
      { label: "Half", price: 1590 },
    ],
    tags: ["Slow-Cooked", "Contains Dairy"],
    spice: "Hot",
    prepTime: 45,
    available: true,
    rating: 4.6,
    reviewCount: 187,
    badge: null,
  },
  {
    id: "chicken-handi",
    name: "Chicken Handi",
    category: "Pakistani",
    description:
      "Creamy tomato-cashew gravy simmered slow in a clay handi, topped with julienned ginger.",
    image:
      "/images/photo-1631292784640-2b24be784d5d.webp",
    sizes: [
      { label: "Full", price: 1590 },
      { label: "Half", price: 990 },
    ],
    tags: ["Contains Nuts", "Creamy"],
    spice: "Medium",
    prepTime: 35,
    available: true,
    rating: 4.5,
    reviewCount: 156,
    badge: null,
  },
  {
    id: "chef-special-soup",
    name: "Chef Special Soup",
    category: "Soups",
    description:
      "A house recipe of shredded chicken, egg ribbons and cracked pepper in a silky clear broth.",
    image:
      "/images/photo-1547592166-23ac45744acd.webp",
    sizes: [
      { label: "Full", price: 590 },
      { label: "Half", price: 380 },
    ],
    tags: ["Contains Egg", "Light"],
    spice: "Mild",
    prepTime: 15,
    available: true,
    rating: 4.4,
    reviewCount: 96,
    badge: null,
  },
  {
    id: "seekh-kabab",
    name: "Seekh Kabab",
    category: "BBQ",
    description:
      "Hand-skewered minced beef with roasted spices, smoked over open flame for a charred finish.",
    image:
      "/images/photo-1599487488170-d11ec9c172f0.webp",
    sizes: [
      { label: "Full", price: 750 },
      { label: "Half", price: 470 },
    ],
    tags: ["Char-Grilled", "Beef"],
    spice: "Medium",
    prepTime: 20,
    available: true,
    rating: 4.6,
    reviewCount: 241,
    badge: null,
  },
  {
    id: "biryani",
    name: "Zaify's Biryani",
    category: "Pakistani",
    description:
      "Fragrant basmati layered with slow-cooked chicken, whole spices and saffron, dum-cooked.",
    image:
      "/images/photo-1589302168068-964664d93dc0.webp",
    sizes: [
      { label: "Full", price: 950 },
      { label: "Half", price: 600 },
    ],
    tags: ["Fragrant", "Contains Dairy"],
    spice: "Medium",
    prepTime: 30,
    available: true,
    rating: 4.7,
    reviewCount: 289,
    badge: "Bestseller",
  },
  {
    id: "chicken-sandwich",
    name: "Chicken Sandwich",
    category: "Fast Food",
    description:
      "Crisped chicken fillet, house sauce and fresh greens, layered between toasted brioche.",
    image:
      "/images/photo-1550507992-eb63ffee0847.webp",
    sizes: [{ label: "Regular", price: 690 }],
    tags: ["Contains Gluten", "Toasted"],
    spice: "Mild",
    prepTime: 15,
    available: true,
    rating: 4.2,
    reviewCount: 84,
    badge: null,
  },
  {
    id: "singapore-chowmein",
    name: "Singapore Chowmein",
    category: "Chinese",
    description:
      "Wok-tossed rice noodles with curry spice, prawns, chicken and crisp julienned vegetables.",
    image:
      "/images/photo-1585032226651-759b368d7246.webp",
    sizes: [
      { label: "Full", price: 890 },
      { label: "Half", price: 560 },
    ],
    tags: ["Contains Seafood", "Wok-Tossed"],
    spice: "Medium",
    prepTime: 20,
    available: true,
    rating: 4.5,
    reviewCount: 173,
    badge: null,
  },
  {
    id: "mongolian-chicken",
    name: "Mongolian Chicken",
    category: "Chinese",
    description:
      "Crispy chicken glazed in a sweet-savoury soy reduction with scallion and toasted sesame.",
    image:
      "/images/photo-1626082927389-6cd097cdc6ec.webp",
    sizes: [
      { label: "Full", price: 990 },
      { label: "Half", price: 620 },
    ],
    tags: ["Contains Sesame", "Crispy"],
    spice: "Medium",
    prepTime: 20,
    available: true,
    rating: 4.6,
    reviewCount: 158,
    badge: null,
  },
  {
    id: "chicken-tikka",
    name: "Chicken Tikka",
    category: "BBQ",
    description:
      "Bone-in chicken marinated overnight in yoghurt and Kashmiri chilli, grilled to a smoky char.",
    image:
      "/images/photo-1610057099431-d73a1c9d2f2f.webp",
    sizes: [
      { label: "Full", price: 820 },
      { label: "Half", price: 520 },
    ],
    tags: ["Char-Grilled", "Yoghurt-Marinated"],
    spice: "Hot",
    prepTime: 25,
    available: true,
    rating: 4.5,
    reviewCount: 204,
    badge: null,
  },
  {
    id: "chicken-qorma",
    name: "Chicken Qorma",
    category: "Pakistani",
    description:
      "A velvety yoghurt-based curry finished with fried onion and a whisper of rosewater.",
    image:
      "/images/photo-1631452180519-c014fe946bc7.webp",
    sizes: [
      { label: "Full", price: 1450 },
      { label: "Half", price: 900 },
    ],
    tags: ["Contains Dairy", "Contains Nuts"],
    spice: "Mild",
    prepTime: 30,
    available: true,
    rating: 4.4,
    reviewCount: 132,
    badge: null,
  },
  {
    id: "egg-fried-rice",
    name: "Egg Fried Rice",
    category: "Chinese",
    description:
      "Wok-hei fragrant rice tossed with egg ribbons, spring onion and light soy.",
    image:
      "/images/photo-1603133872878-684f208fb84b.webp",
    sizes: [
      { label: "Full", price: 590 },
      { label: "Half", price: 380 },
    ],
    tags: ["Contains Egg", "Wok-Hei"],
    spice: "Mild",
    prepTime: 15,
    available: true,
    rating: 4.3,
    reviewCount: 118,
    badge: null,
  },
  {
    id: "moroccan-steak",
    name: "Moroccan Steak",
    category: "Steaks",
    description:
      "Char-seared tenderloin rubbed with ras el hanout, resting on a smoked paprika jus.",
    image:
      "/images/photo-1600891964092-4316c288032e.webp",
    sizes: [
      { label: "8 oz", price: 2890 },
      { label: "12 oz", price: 3890 },
    ],
    tags: ["Tenderloin", "Contains Dairy"],
    spice: "Medium",
    prepTime: 35,
    available: true,
    rating: 4.7,
    reviewCount: 127,
    badge: "Chef's Pick",
  },
  {
    id: "tarragon-steak",
    name: "Tarragon Steak",
    category: "Steaks",
    description:
      "Prime cut finished in herb butter, tarragon cream and cracked black pepper.",
    image:
      "/images/photo-1546964124-0cce460f38ef.webp",
    sizes: [
      { label: "8 oz", price: 2950 },
      { label: "12 oz", price: 3950 },
    ],
    tags: ["Prime Cut", "Contains Dairy"],
    spice: "Mild",
    prepTime: 35,
    available: true,
    rating: 4.6,
    reviewCount: 98,
    badge: null,
  },
  {
    id: "alfredo-pasta",
    name: "Alfredo Pasta",
    category: "Fast Food",
    description:
      "Penne folded through a silky parmesan cream sauce with grilled chicken and herbs.",
    image:
      "/images/photo-1645112411341-6c4fd023714a.webp",
    sizes: [
      { label: "Full", price: 990 },
      { label: "Half", price: 620 },
    ],
    tags: ["Vegetarian", "Contains Gluten"],
    spice: "Mild",
    prepTime: 20,
    available: true,
    rating: 4.3,
    reviewCount: 106,
    badge: null,
  },
  {
    id: "wraps",
    name: "Zaify's Wraps",
    category: "Fast Food",
    description:
      "Char-grilled chicken, house garlic mayo and pickled onion rolled in a warm paratha.",
    image:
      "/images/photo-1626700051175-6818013e1d4f.webp",
    sizes: [{ label: "Regular", price: 650 }],
    tags: ["Handheld", "Contains Gluten"],
    spice: "Mild",
    prepTime: 15,
    available: true,
    rating: 4.4,
    reviewCount: 149,
    badge: null,
  },
  {
    id: "blueberry-shake",
    name: "Blueberry Shake",
    category: "Drinks",
    description:
      "Fresh blueberries blended thick with cream and a touch of honey.",
    image:
      "/images/photo-1553530666-ba11a7da3888.webp",
    sizes: [
      { label: "Regular", price: 490 },
      { label: "Large", price: 650 },
    ],
    tags: ["Vegetarian", "Contains Dairy"],
    spice: null,
    prepTime: 10,
    available: true,
    rating: 4.5,
    reviewCount: 88,
    badge: null,
  },
  {
    id: "peach-juice",
    name: "Peach Juice",
    category: "Drinks",
    description:
      "Chilled and freshly pressed, lightly sweetened, served over ice.",
    image:
      "/images/photo-1622597467836-f3285f2131b8.webp",
    sizes: [
      { label: "Regular", price: 420 },
      { label: "Large", price: 560 },
    ],
    tags: ["Vegetarian", "Fresh-Pressed"],
    spice: null,
    prepTime: 8,
    available: false,
    rating: 4.2,
    reviewCount: 74,
    badge: null,
  },
  {
    id: "chocolate-lava",
    name: "Chocolate Lava Cake",
    category: "Desserts",
    description:
      "Warm dark-chocolate sponge with a molten centre, served with vanilla bean ice cream.",
    image:
      "/images/photo-1624353365286-3f8d62daad51.webp",
    sizes: [{ label: "Regular", price: 590 }],
    tags: ["Vegetarian", "Contains Dairy"],
    spice: null,
    prepTime: 15,
    available: true,
    rating: 4.6,
    reviewCount: 192,
    badge: "New",
  },
];

/** Ids featured in the "Signature Dishes" section, in display order. */
export const signatureDishIds = [
  "chicken-karahi",
  "moroccan-steak",
  "malai-boti",
  "biryani",
];

export const signatureDishes = menuItems.filter((item) =>
  signatureDishIds.includes(item.id)
);
