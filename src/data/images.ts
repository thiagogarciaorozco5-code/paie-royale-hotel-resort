import hero from "@/assets/hero-resort.jpg";
import room101 from "@/assets/room-101.jpg";
import room102 from "@/assets/room-102.jpg";
import room201 from "@/assets/room-201.jpg";
import room202 from "@/assets/room-202.jpg";
import room301 from "@/assets/room-301.jpg";
import room302 from "@/assets/room-302.jpg";
import bathroom from "@/assets/bathroom.jpg";
import spa from "@/assets/spa.jpg";
import restaurant from "@/assets/restaurant.jpg";
import romance from "@/assets/pkg-romance.jpg";
import coffee from "@/assets/pkg-coffee.jpg";

// Stored data references images by stable keys ("asset:room-101") so persisted
// records survive asset renames; uploaded images are stored as data URLs.
const assets: Record<string, string> = {
  hero,
  "room-101": room101,
  "room-102": room102,
  "room-201": room201,
  "room-202": room202,
  "room-301": room301,
  "room-302": room302,
  bathroom,
  spa,
  restaurant,
  romance,
  coffee,
};

export function img(src: string | undefined) {
  if (!src) return assets.hero;
  if (src.startsWith("asset:")) return assets[src.slice(6)] ?? assets.hero;
  return src;
}

export const heroImage = hero;
