import type { BrandCase, Review } from "./types";

const coffeeReviews: Review[] = [
  { id: "c1", author: "Nora K.", initials: "NK", rating: 2, text: "My oat latte arrived cold again. I live 8 minutes away, so this is definitely a packaging problem.", date: "18m ago", source: "Google" },
  { id: "c2", author: "Jamal P.", initials: "JP", rating: 1, text: "Third order this month that showed up lukewarm and spilled in the bag. The courier was kind, but the cup lid was soaked.", date: "46m ago", source: "Google" },
  { id: "c3", author: "Elena R.", initials: "ER", rating: 2, text: "Love the beans, hate the delivery. Coffee was cold by the time it reached our office and one drink leaked everywhere.", date: "1h ago", source: "Google" },
  { id: "c4", author: "Miles T.", initials: "MT", rating: 5, text: "The new pistachio cold brew is unreal. The barista remembered my name and the cardamom foam is perfect.", date: "2h ago", source: "Google" },
  { id: "c5", author: "Priya S.", initials: "PS", rating: 5, text: "Best work café in the neighborhood. Calm music, fast Wi‑Fi, and every espresso has been beautiful.", date: "3h ago", source: "Google" },
  { id: "c6", author: "Drew L.", initials: "DL", rating: 3, text: "Great coffee once you get it. The 8:30am queue took almost 20 minutes today.", date: "4h ago", source: "Google" },
  { id: "c7", author: "Sophie A.", initials: "SA", rating: 5, text: "I have tried every oat latte around here and this one wins. Rich, smooth, and never too sweet.", date: "Yesterday", source: "Google" },
  { id: "c8", author: "Theo M.", initials: "TM", rating: 2, text: "It used to arrive hot. This week both delivery coffees were cold, even before the meeting started.", date: "Yesterday", source: "Google" },
  { id: "c9", author: "Ines V.", initials: "IV", rating: 4, text: "Beautiful space and genuinely lovely staff. Would love a clearer pickup shelf during the rush.", date: "Yesterday", source: "Google" },
  { id: "c10", author: "Owen B.", initials: "OB", rating: 5, text: "The pistachio cold brew made a bad Monday much better. Worth the walk, every time.", date: "2d ago", source: "Google" },
  { id: "c11", author: "Maya C.", initials: "MC", rating: 1, text: "Latte was cold and the lid leaked through my tote bag. Please fix delivery packaging.", date: "2d ago", source: "Google" },
  { id: "c12", author: "Alex H.", initials: "AH", rating: 4, text: "Fantastic roast quality. Morning line moves a little slowly but the team is warm and attentive.", date: "2d ago", source: "Google" },
];

const skincareReviews: Review[] = [
  { id: "s1", author: "Ayla N.", initials: "AN", rating: 1, text: "My serum arrived with the pump loose and half the bottle leaked into the mailer. Such a waste.", date: "22m ago", source: "Shopify" },
  { id: "s2", author: "Jamie W.", initials: "JW", rating: 2, text: "The glow serum itself is gorgeous, but the packaging leaked twice now. Please improve the cap before I reorder.", date: "1h ago", source: "Shopify" },
  { id: "s3", author: "Gina O.", initials: "GO", rating: 5, text: "My skin looks rested after one week. The Dewdrop Serum gives the softest glass-skin glow without any stickiness.", date: "2h ago", source: "Shopify" },
  { id: "s4", author: "Leah B.", initials: "LB", rating: 5, text: "Finally a vitamin C that does not pill under sunscreen. I have already sent it to three friends.", date: "3h ago", source: "Shopify" },
  { id: "s5", author: "Natalie R.", initials: "NR", rating: 3, text: "Love the formula, delivery took nine days. Tracking did not update for almost a week.", date: "4h ago", source: "Shopify" },
  { id: "s6", author: "Cleo K.", initials: "CK", rating: 5, text: "This is my holy-grail serum. My makeup sits better and the finish is luminous, never oily.", date: "Yesterday", source: "Shopify" },
  { id: "s7", author: "Rana D.", initials: "RD", rating: 2, text: "Box was damp when it arrived and the serum leaked around the dropper. The product is lovely though.", date: "Yesterday", source: "Shopify" },
  { id: "s8", author: "Sana I.", initials: "SI", rating: 5, text: "The before-and-after is real. Calm, hydrated, dewy skin in a bottle.", date: "Yesterday", source: "Shopify" },
  { id: "s9", author: "Mina F.", initials: "MF", rating: 4, text: "Beautiful product and fast support response. A travel size would be amazing.", date: "2d ago", source: "Shopify" },
  { id: "s10", author: "Cara P.", initials: "CP", rating: 5, text: "Dewdrop Serum is the one product I repurchase before it runs out. My skin drinks it up.", date: "2d ago", source: "Shopify" },
];

export const demoCases: BrandCase[] = [
  {
    id: "coffee",
    name: "Lumen Coffee",
    category: "Independent coffee & delivery",
    handle: "@lumencoffee",
    rating: 4.6,
    reviewCount: 1842,
    trend: "+24% reviews this week",
    sourceLabel: "Google Maps · last 7 days",
    accent: "#F59E0B",
    managerEmail: "care@lumencoffee.example",
    managerWhatsApp: "https://wa.me/905555555555?text=Hi%20Lumen%20Coffee%2C%20I%20need%20help%20with%20my%20order.",
    reviews: coffeeReviews,
  },
  {
    id: "skincare",
    name: "Vela Skin",
    category: "DTC skincare",
    handle: "@velaskin",
    rating: 4.8,
    reviewCount: 926,
    trend: "+18% reviews this week",
    sourceLabel: "Shopify · last 7 days",
    accent: "#F472B6",
    managerEmail: "hello@velaskin.example",
    managerWhatsApp: "https://wa.me/905555555555?text=Hi%20Vela%20Skin%2C%20I%20need%20help%20with%20my%20order.",
    reviews: skincareReviews,
  },
];

export function getDemoCase(id: BrandCase["id"] = "coffee"): BrandCase {
  const selected = demoCases.find((item) => item.id === id) ?? demoCases[0];
  return JSON.parse(JSON.stringify(selected)) as BrandCase;
}
