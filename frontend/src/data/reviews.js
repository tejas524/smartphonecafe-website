/**
 * Google Reviews content — DATA-DRIVEN.
 *
 * This module is the single source of truth for the homepage reviews section.
 * It is deliberately shaped like an API payload so it can later be swapped for
 * a live fetch (Google Places / Business Profile) without changing the UI:
 * the component reads `reviewsSummary` and `reviews` only.
 *
 * HONESTY:
 *   - `rating` (4.9) and `reviewCount` (324) are the summary figures shown on
 *     the store's public Google listing. The displayed count animates up to
 *     `reviewCount`, so the number is never hard-coded in the component.
 *   - Every review below is a real review transcribed as supplied — no review,
 *     name, star value, date or count is invented, and the star distribution
 *     chart is intentionally NOT recreated (no reliable per-star counts exist).
 *   - `googleUrl` reuses the existing verified listing link; no new URL.
 */

import { business } from "./site.js";

export const reviewsSummary = {
  rating: 4.9,
  reviewCount: 324,
  googleUrl: business.google.shortUrl,
};

export const reviews = [
  {
    id: "sampat-shinde",
    name: "Sampat Shinde",
    rating: 5,
    date: "4 months ago",
    photos: 4,
    text: "This shop really impressed me with their selection and financing options. They had a wide range of brands like Oppo, Vivo, Samsung, iPhone, Realme, Motorola, and Nokia, which made it easy to find exactly what I was looking for. Plus, they …",
  },
  {
    id: "shivaji-ghardale",
    name: "Shivaji Ghardale",
    rating: 5,
    date: "4 months ago",
    text: "I recently visited this mobile shop, and I have to say, I was really impressed! The owner was super friendly and took the time to help me find exactly what I needed, all at very reasonable prices. It’s definitely my go-to place for anything mobile!",
  },
  {
    id: "sujata-jadhav",
    name: "Sujata Jadhav",
    rating: 5,
    date: "4 weeks ago",
    text: "Very fast service, change my mobile display touch glass in one hour, rate are very reasonable, recommended for mobile repair.",
  },
  {
    id: "jijaram-kaldoke",
    name: "Jijaram Kaldoke",
    rating: 5,
    date: "5 months ago",
    text: "Very nice service and cooperative staff, good product rang also repair service available here, must visit for any mobile phone related problem.",
  },
  {
    id: "alom-hoque",
    name: "Alom Hoque",
    rating: 5,
    date: "a year ago",
    photos: 3,
    text: "Very good service, Repair my OnePlus mobile here, rate are very reasonable, mobile wrap also available here, recommended for your all mobile needs, keep it up 😊 …",
  },
  {
    id: "pappu",
    name: "Pappu",
    rating: 5,
    date: "3 weeks ago",
    isNew: true,
    text: "Good Shop, fast service and owner is also very cooperative.",
  },
];
