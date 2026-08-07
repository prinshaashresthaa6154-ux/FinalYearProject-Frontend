export type DestinationCategory =
  | "cultural"
  | "mountains"
  | "religious"
  | "adventure"
  | "wildlife";

export interface DestinationDetail {
  id: number;
  title: string;
  category: DestinationCategory;
  categoryLabel: string;
  location: string;
  description: string;
  about: string;
  bestTime: string;
  price: number;
  rating: number;
  reviews: number;
  altitude: string;
  highlights: string[];
}

export const DESTINATION_FILTERS: {
  id: "all" | DestinationCategory;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "cultural", label: "Cultural" },
  { id: "mountains", label: "Mountains" },
  { id: "religious", label: "Religious" },
  { id: "adventure", label: "Adventure" },
  { id: "wildlife", label: "Wildlife" },
];

export const DESTINATIONS: DestinationDetail[] = [
  {
    id: 1,
    title: "Everest Base Camp",
    category: "mountains",
    categoryLabel: "Mountain",
    location: "Solukhumbu, Koshi Province",
    description:
      "Trek to the foot of the world's highest peak through stunning Sherpa villages, ancient monasteries, and breathtaking glacial valleys.",
    about:
      "The Everest Base Camp trek is the ultimate adventure for mountain lovers. Follow the footsteps of legendary mountaineers through the Khumbu region, passing through Sherpa villages, ancient monasteries, and breathtaking glacial valleys. The trek offers unparalleled views of Mt. Everest (8,848m), Lhotse, Nuptse, and Ama Dablam.",
    bestTime: "Mar-May, Sep-Nov",
    price: 1200,
    rating: 4.9,
    reviews: 2847,
    altitude: "5,364m",
    highlights: [
      "Kala Patthar viewpoint",
      "Tengboche Monastery",
      "Namche Bazaar",
      "Khumbu Glacier",
    ],
  },
  {
    id: 2,
    title: "Pokhara Lakeside",
    category: "adventure",
    categoryLabel: "Adventure",
    location: "Kaski, Gandaki Province",
    description:
      "Nepal's adventure capital with stunning lakes, mountain views, paragliding, and a vibrant lakeside atmosphere.",
    about:
      "Pokhara is Nepal's adventure capital, set beside the calm waters of Phewa Lake with the Annapurna range rising behind it. Visitors come for paragliding, boating, lakeside cafes, and easy access to popular treks. The city blends relaxed evenings with day trips into the surrounding hills and valleys.",
    bestTime: "Oct-Apr",
    price: 350,
    rating: 4.9,
    reviews: 1920,
    altitude: "822m",
    highlights: [
      "Phewa Lake boating",
      "Sarangkot sunrise",
      "Paragliding",
      "World Peace Pagoda",
    ],
  },
  {
    id: 3,
    title: "Pashupatinath Temple",
    category: "religious",
    categoryLabel: "Religious",
    location: "Kathmandu, Bagmati Province",
    description:
      "Sacred Hindu temple complex and UNESCO World Heritage Site on the banks of the Bagmati River.",
    about:
      "Pashupatinath is one of the holiest Hindu temples dedicated to Lord Shiva. The sprawling complex along the Bagmati River includes temples, shrines, and ghats that remain central to spiritual life in Kathmandu. It is a UNESCO World Heritage Site and an essential stop for cultural and religious travelers.",
    bestTime: "Year-round",
    price: 25,
    rating: 4.9,
    reviews: 1560,
    altitude: "1,400m",
    highlights: [
      "Main Shiva temple",
      "Bagmati River ghats",
      "Evening aarti",
      "UNESCO heritage site",
    ],
  },
  {
    id: 4,
    title: "Lumbini",
    category: "religious",
    categoryLabel: "Religious",
    location: "Rupandehi, Lumbini Province",
    description:
      "Birthplace of Lord Buddha and a UNESCO World Heritage Site with monasteries from around the world.",
    about:
      "Lumbini is the birthplace of Lord Buddha and a major pilgrimage destination. The sacred garden, Maya Devi Temple, and monasteries built by communities from around the world create a peaceful atmosphere. Visitors come for reflection, cultural learning, and the quiet beauty of the UNESCO-listed site.",
    bestTime: "Oct-Mar",
    price: 30,
    rating: 4.9,
    reviews: 860,
    altitude: "150m",
    highlights: [
      "Maya Devi Temple",
      "Sacred Garden",
      "International monasteries",
      "Ashoka Pillar",
    ],
  },
  {
    id: 5,
    title: "Chitwan National Park",
    category: "wildlife",
    categoryLabel: "Wildlife",
    location: "Chitwan, Bagmati Province",
    description:
      "Nepal's first national park and UNESCO site home to one-horned rhinos, tigers, and jungle safaris.",
    about:
      "Chitwan National Park is Nepal's first national park and a UNESCO World Heritage Site. Dense forests and riverine grasslands support one-horned rhinos, Bengal tigers, elephants, and rich birdlife. Jeep safaris, canoe rides, and guided jungle walks make it the country's premier wildlife experience.",
    bestTime: "Oct-Mar",
    price: 180,
    rating: 4.9,
    reviews: 1104,
    altitude: "150m",
    highlights: [
      "Jungle safari",
      "One-horned rhinos",
      "Canoe on Rapti River",
      "Tharu cultural show",
    ],
  },
  {
    id: 6,
    title: "Bhaktapur Durbar Square",
    category: "cultural",
    categoryLabel: "Cultural",
    location: "Bhaktapur, Bagmati Province",
    description:
      "Ancient Newari city with medieval architecture, pottery square, and living cultural heritage.",
    about:
      "Bhaktapur Durbar Square is the heart of an ancient Newari city known for medieval temples, carved woodwork, and traditional craft. Pottery Square, courtyards, and heritage lanes give a vivid sense of Kathmandu Valley culture. It is ideal for travelers interested in architecture, history, and local life.",
    bestTime: "Year-round",
    price: 20,
    rating: 4.9,
    reviews: 980,
    altitude: "1,401m",
    highlights: [
      "55-Window Palace",
      "Nyatapola Temple",
      "Pottery Square",
      "Newari cuisine",
    ],
  },
];

export function getDestinationById(id: number) {
  return DESTINATIONS.find((d) => d.id === id);
}
