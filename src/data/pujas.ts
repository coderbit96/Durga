export type Puja = {
  area: string;
  description: string;
  highlights: string[];
  name: string;
  slug: string;
  transport: string;
  zone: "North Kolkata" | "South Kolkata";
};

export type SuggestedRoute = {
  duration: string;
  name: string;
  slug: string;
  stops: string[];
  summary: string;
};

export const pujas: Puja[] = [
  {
    area: "Bagbazar",
    description:
      "A heritage stop with classic rituals, old Kolkata streets, and easy access to riverside food breaks.",
    highlights: ["Heritage ambience", "Traditional pratima", "Evening aarti"],
    name: "Bagbazar Sarbojanin",
    slug: "sample-bagbazar-sarbojanin",
    transport: "Metro to Shyambazar, then walk or take a short ride.",
    zone: "North Kolkata",
  },
  {
    area: "Sovabazar",
    description:
      "A compact North Kolkata anchor for visitors who want history, lanes, and multiple nearby pujas.",
    highlights: ["Bonedi bari circuit", "Photo-friendly lanes", "Food stops"],
    name: "Sovabazar Rajbari Cluster",
    slug: "sample-sovabazar-rajbari-cluster",
    transport: "Metro to Sovabazar Sutanuti.",
    zone: "North Kolkata",
  },
  {
    area: "Ahiritola",
    description:
      "Known for creative presentation while staying close to the old city route spine.",
    highlights: ["Theme decor", "River proximity", "North route link"],
    name: "Ahiritola Sarbojanin",
    slug: "sample-ahiritola-sarbojanin",
    transport: "Metro to Sovabazar Sutanuti or Girish Park.",
    zone: "North Kolkata",
  },
  {
    area: "Ballygunge",
    description:
      "A polished South Kolkata favorite with strong crowd management and accessible evening movement.",
    highlights: ["Large installation", "Organized entry", "Dining nearby"],
    name: "Ballygunge Cultural",
    slug: "sample-ballygunge-cultural",
    transport: "Reach via Ballygunge station or nearby bus routes.",
    zone: "South Kolkata",
  },
  {
    area: "Deshapriya Park",
    description:
      "A major crowd-puller near key South Kolkata connectors and late-night food options.",
    highlights: ["Iconic ground", "High energy", "Metro access"],
    name: "Deshapriya Park",
    slug: "sample-deshapriya-park",
    transport: "Metro to Kalighat or Rabindra Sarobar.",
    zone: "South Kolkata",
  },
  {
    area: "Jodhpur Park",
    description:
      "A practical route stop with theme-led design and quick movement toward Lake Gardens and Gariahat.",
    highlights: ["Theme concept", "South cluster", "Family friendly"],
    name: "Jodhpur Park 95 Pally",
    slug: "sample-jodhpur-park-95-pally",
    transport: "Use Jadavpur, Dhakuria, or nearby bus connectors.",
    zone: "South Kolkata",
  },
];

export const featuredPujas = pujas.slice(0, 4);

export const suggestedRoutes: SuggestedRoute[] = [
  {
    duration: "4-5 hours",
    name: "North Kolkata Heritage Loop",
    slug: "north-kolkata-heritage-loop",
    stops: ["Bagbazar Sarbojanin", "Sovabazar Rajbari Cluster", "Ahiritola Sarbojanin"],
    summary:
      "A compact evening route for classic North Kolkata texture, rituals, and narrow-lane ambience.",
  },
  {
    duration: "5-6 hours",
    name: "South Kolkata Theme Run",
    slug: "south-kolkata-theme-run",
    stops: ["Ballygunge Cultural", "Deshapriya Park", "Jodhpur Park 95 Pally"],
    summary:
      "A high-energy South Kolkata trail with strong theme pujas and late-night food options nearby.",
  },
  {
    duration: "Full evening",
    name: "Metro-Friendly Highlights",
    slug: "metro-friendly-highlights",
    stops: ["Sovabazar Rajbari Cluster", "Bagbazar Sarbojanin", "Deshapriya Park"],
    summary:
      "A mixed route designed around metro access and fewer long road transfers during peak crowds.",
  },
];

export function getPujasByZone(zone: Puja["zone"]) {
  return pujas.filter((puja) => puja.zone === zone);
}

export function getPujaBySlug(slug: string) {
  return pujas.find((puja) => puja.slug === slug);
}

export function getRouteBySlug(slug: string) {
  return suggestedRoutes.find((route) => route.slug === slug);
}
