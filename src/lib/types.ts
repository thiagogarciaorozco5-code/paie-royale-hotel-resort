// Domain types. These mirror the future database tables (rooms, services, packages,
// promotions, reservations, profiles, user_roles) so persistence can be swapped in.

export type Role = "cliente" | "administrador";

export type RoomStatus = "disponible" | "mantenimiento" | "inactiva";
export type BedType = "king" | "queen" | "doble" | "dos-camas" | "familiar";

export interface DateRange {
  from: string; // YYYY-MM-DD (America/Bogota)
  to: string; // YYYY-MM-DD exclusive (checkout day)
  reason?: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  shortDescription: string;
  description: string;
  bedType: BedType;
  bedConfiguration: string;
  capacity: number;
  sizeM2: number;
  view: string;
  pricePerNight: number;
  status: RoomStatus;
  images: string[];
  amenities: string[];
  bathroom: string;
  policies: string[];
  blockedRanges: DateRange[];
}

export type ServiceUnit = "persona" | "estadia" | "noche";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: ServiceUnit;
  available: boolean;
  unavailableReason?: string;
  icon: "coffee" | "spa" | "car" | "utensils" | "wine" | "baby" | "mountain" | "sparkles";
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // total for the package stay
  nights: number;
  maxGuests: number;
  roomId: string; // room assigned for overlap checks
  image: string;
  includes: string[];
  extraServiceIds: string[];
  active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number;
  appliesTo: "habitaciones" | "paquetes" | "todo";
  validUntil: string; // YYYY-MM-DD
  terms: string[];
  image: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  promoOptIn: boolean;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export type BookingKind = "habitacion" | "paquete";

export interface BookingDraft {
  kind: BookingKind;
  itemId: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  adults: number;
  children: number;
  serviceIds: string[];
  promoCode?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta";
export type PaymentStatus =
  | "pendiente_hotel"
  | "pendiente_verificacion"
  | "aprobado_demo"
  | "pagado"
  | "reembolsado";
export type ReservationStatus = "confirmada" | "pendiente" | "cancelada" | "completada";

export interface PriceLine {
  label: string;
  detail?: string;
  amount: number;
}

export interface PriceBreakdown {
  nights: number;
  lodging: PriceLine;
  services: PriceLine[];
  subtotal: number;
  discount: number;
  discountLabel?: string;
  taxableBase: number;
  iva: number;
  insurance: number;
  total: number;
}

export interface Reservation {
  id: string;
  code: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  kind: BookingKind;
  itemId: string;
  itemName: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  adults: number;
  children: number;
  serviceIds: string[];
  promoCode?: string;
  pricing: PriceBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string; // transfer file name or card last4 (never full card)
  status: ReservationStatus;
  createdAt: string;
}

export interface EmailCampaign {
  id: string;
  promotionId: string;
  subject: string;
  recipientCount: number;
  status: "pendiente_proveedor";
  createdAt: string;
}
