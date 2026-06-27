export interface GuideReview {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface GuideAvailability {
  month: string;
  status: "Available" | "Booked";
}

export interface Guide {
  id: number;
  initials: string;
  name: string;
  category: string;
  categoryExpert: string;
  rating: number;
  reviews: number;
  price: number;
  description: string;
  about: string;
  location: string;
  experience: string;
  trips: string;
  languages: string[];
  tags: string[];
  certifications: string[];
  touristReviews: GuideReview[];
  availability: GuideAvailability[];
}

export const GUIDES: Guide[] = [
  {
    id: 1,
    initials: "PS",
    name: "Pemba Sherpa",
    category: "Trekking",
    categoryExpert: "Trekking Expert",
    rating: 4.9,
    reviews: 245,
    price: 80,
    description:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks",
    about:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks and has guided over 380 successful expeditions across the Himalayas. Certified by Nepal Mountaineering Association with Wilderness First Aid training.",
    location: "Namche Bazar",
    experience: "12 years",
    trips: "380 trips",
    languages: ["English", "Nepali", "Tibetan"],
    tags: ["Everest Base Camp", "Annapurna Circuit", "Langtang Valley"],
    certifications: [
      "Nepal Mountaineering Association",
      "Wilderness First Aid",
      "High Altitude Guide License",
    ],
    touristReviews: [
      {
        name: "Sarah J.",
        rating: 5,
        text: "Pemba was an incredible guide! His knowledge of the mountains and local culture made our Everest trek unforgettable.",
        date: "Feb 2026",
      },
      {
        name: "Michael T.",
        rating: 5,
        text: "Professional, patient, and always put safety first. Highly recommended for any high-altitude adventure.",
        date: "Jan 2026",
      },
      {
        name: "Emily R.",
        rating: 5,
        text: "Best guide we've ever had. Pemba's experience and warmth made us feel safe throughout the trek.",
        date: "Dec 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Booked" },
      { month: "April 2026", status: "Available" },
      { month: "May 2026", status: "Booked" },
      { month: "June 2026", status: "Booked" },
    ],
  },
  {
    id: 2,
    initials: "SG",
    name: "Sita Gurung",
    category: "Cultural",
    categoryExpert: "Cultural Expert",
    rating: 4.8,
    reviews: 189,
    price: 65,
    description:
      "Passionate cultural historian specializing in Kathmandu Valley heritage tours",
    about:
      "Passionate cultural historian specializing in Kathmandu Valley heritage tours. With a decade of experience, Sita brings ancient temples, royal palaces, and living traditions to life for travelers from around the world.",
    location: "Kathmandu",
    experience: "10 years",
    trips: "290 trips",
    languages: ["English", "Nepali", "Hindi"],
    tags: ["Pashupatinath", "Bhaktapur Durbar", "Patan Heritage"],
    certifications: [
      "Nepal Tourism Board License",
      "Heritage Site Guide Certification",
      "First Aid Certified",
    ],
    touristReviews: [
      {
        name: "Anna L.",
        rating: 5,
        text: "Sita's storytelling made every temple visit magical. We learned so much about Nepali culture.",
        date: "Feb 2026",
      },
      {
        name: "David K.",
        rating: 5,
        text: "Wonderful guide for Kathmandu Valley. Organized, knowledgeable, and very friendly.",
        date: "Jan 2026",
      },
      {
        name: "Priya S.",
        rating: 4,
        text: "Great cultural tour experience. Sita knew all the hidden gems in the old city.",
        date: "Dec 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Available" },
      { month: "April 2026", status: "Booked" },
      { month: "May 2026", status: "Available" },
      { month: "June 2026", status: "Booked" },
    ],
  },
  {
    id: 3,
    initials: "TB",
    name: "Tenzing Bhote",
    category: "Adventure",
    categoryExpert: "Adventure Expert",
    rating: 4.9,
    reviews: 312,
    price: 90,
    description:
      "Adventure specialist with expertise in paragliding, rafting, and bungee experiences",
    about:
      "Adventure specialist with expertise in paragliding, rafting, and bungee experiences. Tenzing has spent over 14 years crafting thrilling yet safe adventures across Nepal's most exciting landscapes.",
    location: "Pokhara",
    experience: "14 years",
    trips: "420 trips",
    languages: ["English", "Nepali", "Tibetan"],
    tags: ["Paragliding", "White Water Rafting", "Bungee Jump"],
    certifications: [
      "Adventure Tourism License",
      "White Water Rafting Certification",
      "Paragliding Instructor License",
    ],
    touristReviews: [
      {
        name: "James W.",
        rating: 5,
        text: "The paragliding experience was absolutely thrilling! Tenzing made us feel completely safe.",
        date: "Feb 2026",
      },
      {
        name: "Lisa M.",
        rating: 5,
        text: "Best adventure guide in Pokhara. Rafting and bungee were highlights of our trip.",
        date: "Jan 2026",
      },
      {
        name: "Tom H.",
        rating: 5,
        text: "Incredible energy and professionalism. Would book again without hesitation.",
        date: "Nov 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Booked" },
      { month: "April 2026", status: "Booked" },
      { month: "May 2026", status: "Available" },
      { month: "June 2026", status: "Available" },
    ],
  },
  {
    id: 4,
    initials: "RL",
    name: "Ram Lama",
    category: "Religious",
    categoryExpert: "Religious Expert",
    rating: 4.7,
    reviews: 156,
    price: 55,
    description:
      "Licensed spiritual guide with deep knowledge of Buddhist monasteries and pilgrimage routes",
    about:
      "Licensed spiritual guide with deep knowledge of Buddhist monasteries and pilgrimage routes. Ram offers meaningful journeys through Nepal's sacred sites with respect and profound cultural insight.",
    location: "Lumbini",
    experience: "8 years",
    trips: "210 trips",
    languages: ["English", "Nepali", "Tibetan", "Hindi"],
    tags: ["Lumbini Tour", "Boudhanath", "Swayambhunath"],
    certifications: [
      "Spiritual Tourism Guide License",
      "Buddhist Heritage Certification",
      "First Aid Certified",
    ],
    touristReviews: [
      {
        name: "Maria G.",
        rating: 5,
        text: "A deeply moving pilgrimage experience. Ram's knowledge of Buddhist history is remarkable.",
        date: "Feb 2026",
      },
      {
        name: "Robert C.",
        rating: 4,
        text: "Peaceful and informative tours. Ram was patient and respectful throughout.",
        date: "Jan 2026",
      },
      {
        name: "Yuki T.",
        rating: 5,
        text: "The Lumbini tour was spiritual and well-organized. Highly recommended.",
        date: "Dec 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Available" },
      { month: "April 2026", status: "Available" },
      { month: "May 2026", status: "Booked" },
      { month: "June 2026", status: "Booked" },
    ],
  },
  {
    id: 5,
    initials: "MK",
    name: "Maya Karki",
    category: "Wildlife",
    categoryExpert: "Wildlife Expert",
    rating: 4.8,
    reviews: 198,
    price: 70,
    description:
      "Wildlife expert and naturalist specializing in Chitwan and Bardia national park safaris",
    about:
      "Wildlife expert and naturalist specializing in Chitwan and Bardia national park safaris. Maya's passion for conservation and sharp eye for wildlife make every safari an unforgettable encounter with nature.",
    location: "Chitwan",
    experience: "11 years",
    trips: "340 trips",
    languages: ["English", "Nepali", "Hindi"],
    tags: ["Chitwan Safari", "Bird Watching", "Jungle Trek"],
    certifications: [
      "Wildlife Guide License",
      "Jungle Safari Certification",
      "Bird Watching Specialist",
    ],
    touristReviews: [
      {
        name: "Chris B.",
        rating: 5,
        text: "Spotted rhinos and tigers on our safari! Maya knows the jungle like the back of her hand.",
        date: "Feb 2026",
      },
      {
        name: "Helen P.",
        rating: 5,
        text: "Amazing bird watching tour. Maya identified dozens of species we would have missed.",
        date: "Jan 2026",
      },
      {
        name: "Mark D.",
        rating: 4,
        text: "Great safari experience in Chitwan. Very knowledgeable about local wildlife.",
        date: "Dec 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Booked" },
      { month: "April 2026", status: "Available" },
      { month: "May 2026", status: "Available" },
      { month: "June 2026", status: "Booked" },
    ],
  },
  {
    id: 6,
    initials: "AS",
    name: "Ang Sherpa",
    category: "Trekking",
    categoryExpert: "Trekking Expert",
    rating: 4.9,
    reviews: 278,
    price: 85,
    description:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks",
    about:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks across the Khumbu and Annapurna regions. Ang's 15 years of guiding experience ensures safe and memorable Himalayan adventures.",
    location: "Namche Bazar",
    experience: "15 years",
    trips: "410 trips",
    languages: ["English", "Nepali", "Tibetan"],
    tags: ["Everest Base Camp", "Annapurna Circuit", "Langtang Valley"],
    certifications: [
      "Nepal Mountaineering Association",
      "Wilderness First Aid",
      "High Altitude Guide License",
    ],
    touristReviews: [
      {
        name: "John F.",
        rating: 5,
        text: "Ang guided us to Everest Base Camp flawlessly. His experience on the mountain is unmatched.",
        date: "Feb 2026",
      },
      {
        name: "Sophie L.",
        rating: 5,
        text: "Patient, skilled, and always encouraging. Best trekking guide we've ever had.",
        date: "Jan 2026",
      },
      {
        name: "Daniel R.",
        rating: 5,
        text: "The Annapurna Circuit with Ang was the trip of a lifetime. Absolutely recommend.",
        date: "Dec 2025",
      },
    ],
    availability: [
      { month: "March 2026", status: "Available" },
      { month: "April 2026", status: "Booked" },
      { month: "May 2026", status: "Booked" },
      { month: "June 2026", status: "Available" },
    ],
  },
];

export function getGuideById(id: number): Guide | undefined {
  return GUIDES.find((guide) => guide.id === id);
}
