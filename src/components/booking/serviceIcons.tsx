import { Baby, Car, Coffee, Flower2, Mountain, Sparkles, UtensilsCrossed, Wine } from "lucide-react";
import type { Service } from "@/lib/types";

export const serviceIcons: Record<Service["icon"], typeof Coffee> = {
  coffee: Coffee,
  spa: Flower2,
  car: Car,
  utensils: UtensilsCrossed,
  wine: Wine,
  baby: Baby,
  mountain: Mountain,
  sparkles: Sparkles,
};
