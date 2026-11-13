// PAIE ROYALE — API contract v1 (JSON, camelCase). Shared by the frontend and the
// Node/Express/MySQL backend in /backend (which keeps an identical copy in
// backend/src/types/dto.ts). Money is COP as a JS number of whole pesos
// (stored as DECIMAL(14,2) in MySQL). Dates are "YYYY-MM-DD" in America/Bogota;
// timestamps are ISO-8601 UTC strings.

export type ID = number;

// ---------- Errors & pagination ----------
export interface FieldError {
  field: string;
  message: string;
}
export interface ApiErrorBody {
  error: { code: string; message: string; details?: FieldError[]; requestId: string };
}
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

// ---------- Auth & users ----------
export type Role = "cliente" | "admin";
export interface UserDTO {
  id: ID;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  active: boolean;
  promoOptIn: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  reservationsCount?: number; // admin listings only
}
export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserDTO;
}
export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  promoOptIn: boolean;
}

// ---------- Catalog ----------
export type RoomStatus = "disponible" | "mantenimiento" | "inactiva";
export type BedType = "king" | "queen" | "doble" | "dos-camas" | "familiar";
export type DiscountType = "porcentaje" | "precio_fijo";
export type PromotionTarget = "habitacion" | "paquete" | "servicio";
export type PromotionStatus = "activa" | "pausada" | "finalizada";

/** Image reference: "asset:<key>" (bundled frontend asset), "/uploads/<file>" (served by the API) or absolute https URL. */
export interface MediaDTO {
  id: ID;
  url: string;
  alt: string | null;
  sortOrder: number;
}
export interface AmenityDTO {
  id: ID;
  name: string;
}
/** Active promotion applied to a catalog item, already priced. */
export interface PromotionSummary {
  id: ID;
  title: string;
  code: string | null; // null = automatic
  discountType: DiscountType;
  discountValue: number;
  endsAt: string; // YYYY-MM-DD inclusive
  originalPrice: number;
  finalPrice: number;
  discountPercent: number; // rounded, for badges
}
export interface RoomDTO {
  id: ID;
  slug: string;
  number: string;
  name: string;
  shortDescription: string;
  description: string;
  bedType: BedType;
  bedConfiguration: string;
  beds: number;
  capacity: number;
  sizeM2: number;
  view: string;
  pricePerNight: number;
  minNights: number;
  maxNights: number;
  status: RoomStatus;
  images: MediaDTO[];
  amenities: AmenityDTO[];
  bathroom: string;
  policies: string[];
  promotion: PromotionSummary | null;
  createdAt: string;
  updatedAt: string;
}
export interface RoomInput {
  slug?: string;
  number: string;
  name: string;
  shortDescription: string;
  description: string;
  bedType: BedType;
  bedConfiguration: string;
  beds: number;
  capacity: number;
  sizeM2: number;
  view: string;
  pricePerNight: number;
  minNights: number;
  maxNights: number;
  status: RoomStatus;
  bathroom: string;
  policies: string[];
  amenities: string[]; // names; unknown names are created
  images: { url: string; alt?: string | null }[]; // ordered; url from /admin/uploads or asset:
}
export interface StayRuleDTO {
  id: ID;
  roomId: ID | null; // null = all rooms
  roomName: string | null;
  name: string;
  startDate: string; // inclusive
  endDate: string; // exclusive (night of endDate not included)
  minNights: number | null;
  maxNights: number | null;
  nightlyPrice: number | null; // season price override
  active: boolean;
}
export type StayRuleInput = Omit<StayRuleDTO, "id" | "roomName">;
export interface RoomBlockDTO {
  id: ID;
  roomId: ID;
  startDate: string;
  endDate: string; // exclusive
  reason: string | null;
}
export interface AvailabilityDTO {
  roomId: ID;
  from: string;
  to: string;
  occupied: string[]; // nights (YYYY-MM-DD) not bookable
  rules: StayRuleDTO[];
  minNights: number;
  maxNights: number;
}

export type ServiceUnit = "persona" | "estadia" | "noche";
export type ServiceStatus = "activo" | "inactivo" | "agotado";
export type ServiceIcon = "coffee" | "spa" | "car" | "utensils" | "wine" | "baby" | "mountain" | "sparkles";
export interface ServiceDTO {
  id: ID;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: ServiceUnit;
  imageUrl: string | null;
  icon: ServiceIcon;
  status: ServiceStatus; // only "activo" is bookable
  promotion: PromotionSummary | null;
}
export type ServiceInput = Omit<ServiceDTO, "id" | "promotion" | "slug"> & { slug?: string };

export interface PackageDTO {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // total for the package stay
  nights: number;
  maxGuests: number;
  roomId: ID;
  roomName: string;
  imageUrl: string | null;
  includes: string[];
  services: { id: ID; name: string }[]; // included services
  active: boolean;
  promotion: PromotionSummary | null;
}
export interface PackageInput {
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  nights: number;
  maxGuests: number;
  roomId: ID;
  imageUrl: string | null;
  includes: string[];
  serviceIds: ID[];
  active: boolean;
}

export interface PromotionDTO {
  id: ID;
  title: string;
  description: string;
  code: string | null;
  targetType: PromotionTarget;
  targetId: ID;
  targetName: string;
  discountType: DiscountType;
  discountValue: number; // % (1–90) or final price in COP
  startsAt: string; // YYYY-MM-DD inclusive
  endsAt: string; // YYYY-MM-DD inclusive
  maxUses: number | null;
  usesCount: number;
  status: PromotionStatus;
  imageUrl: string | null;
  terms: string[];
  originalPrice: number;
  finalPrice: number;
}
export type PromotionInput = Omit<PromotionDTO, "id" | "targetName" | "usesCount" | "originalPrice" | "finalPrice">;

// ---------- Settings ----------
export type TaxConcept = "alojamiento" | "paquete" | "servicio" | "seguro";
export interface TaxRateDTO {
  concept: TaxConcept;
  name: string;
  rate: number; // 0.19 = 19 %
  active: boolean;
}
export interface SettingsDTO {
  hotelName: string;
  legalName: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  whatsapp: string;
  checkInStart: string; // "15:00"
  checkInEnd: string; // "22:00"
  checkOutStart: string; // "06:00"
  checkOutEnd: string; // "12:00"
  insurancePerGuestNight: number;
  maxNightsOnline: number;
  cancellation: { fullRefundHours: number; partialRefundHours: number; partialRefundPercent: number };
  bank: { name: string; accountType: string; accountNumber: string; holder: string; nit: string };
}
export interface PublicSettingsDTO extends SettingsDTO {
  taxRates: TaxRateDTO[];
  paymentProviders: { id: "simulador" | "wompi"; label: string; configured: boolean }[];
}

// ---------- Quotes, reservations, payments ----------
export type BookingKind = "habitacion" | "paquete";
export interface QuoteRequest {
  kind: BookingKind;
  itemId: ID;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  serviceIds: ID[];
  promoCode?: string;
}
export interface PriceLineDTO {
  concept: TaxConcept;
  label: string;
  detail: string;
  quantity: number;
  unitPrice: number;
  amount: number; // before discount
  discount: number;
  taxRate: number;
  tax: number;
  total: number; // amount - discount + tax
}
export interface PricingDTO {
  currency: "COP";
  nights: number;
  lines: PriceLineDTO[];
  subtotal: number; // sum(amount)
  discountTotal: number;
  taxableBase: number; // subtotal - discountTotal
  taxTotal: number;
  total: number;
  appliedPromotions: { id: ID; title: string; code: string | null; amount: number }[];
}
export interface QuoteResponse {
  available: boolean;
  errors: FieldError[];
  pricing: PricingDTO | null;
}

export type ReservationStatus = "pendiente_pago" | "confirmada" | "cancelada" | "completada" | "no_show";
export type PaymentMethod = "simulado" | "transferencia" | "en_hotel";
export type PaymentStatus = "pendiente" | "en_verificacion" | "aprobado" | "rechazado" | "reembolsado" | "reembolso_parcial";
export type DocumentType = "CC" | "CE" | "PA" | "TI" | "NIT";
export interface GuestDTO {
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  country: string;
  notes: string | null;
}
export interface PaymentDTO {
  id: ID;
  reservationId: ID;
  reservationCode: string;
  method: PaymentMethod;
  provider: "simulador" | "wompi" | "manual";
  status: PaymentStatus;
  amount: number;
  refundedAmount: number;
  reference: string;
  proofUrl: string | null;
  isSimulation: boolean;
  note: string | null;
  createdAt: string;
  processedAt: string | null;
}
export type RefundStatus = "pendiente" | "procesado" | "rechazado";
export interface RefundDTO {
  id: ID;
  paymentId: ID;
  reservationCode: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt: string | null;
}
export interface ReservationDTO {
  id: ID;
  code: string; // "PR-XXXXXX"
  userId: ID;
  userEmail: string;
  status: ReservationStatus;
  kind: BookingKind;
  itemId: ID;
  itemName: string;
  roomId: ID;
  roomNumber: string;
  roomName: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  nights: number;
  adults: number;
  children: number;
  guest: GuestDTO;
  services: { id: ID; name: string; quantity: number; unitPrice: number; amount: number }[];
  pricing: PricingDTO;
  paidAmount: number; // approved minus refunded
  refundedAmount: number;
  balance: number; // total - approved payments (never < 0)
  paymentStatus: PaymentStatus | "sin_pago";
  payments: PaymentDTO[];
  refunds: RefundDTO[];
  cancellation: { cancelledAt: string; reason: string; refundPercent: number; by: "cliente" | "admin" } | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreateReservationInput extends QuoteRequest {
  checkInTime: string;
  checkOutTime: string;
  guest: GuestDTO;
}
export interface CreatePaymentInput {
  reservationCode: string;
  method: PaymentMethod;
  /** Only for method "simulado": outcome chosen in the SIMULATION UI. No card data is ever sent. */
  scenario?: "aprobado" | "rechazado";
}
export interface CancelResult {
  reservation: ReservationDTO;
  refundPercent: number;
  refund: RefundDTO | null;
}

// ---------- Favorites ----------
export interface FavoriteDTO {
  itemType: "habitacion" | "paquete";
  itemId: ID;
  createdAt: string;
}

// ---------- Admin ----------
export interface DashboardDTO {
  range: { from: string; to: string };
  reservationsCount: number;
  previousReservationsCount: number;
  reservationsByStatus: Record<ReservationStatus, number>;
  occupiedRoomNights: number;
  availableRoomNights: number;
  occupancyRate: number; // 0..1
  revenue: number; // approved payments - processed refunds, by payment date in range
  previousRevenue: number;
  revenueChangePct: number | null;
  monthlyRevenue: { month: string; revenue: number; reservations: number }[]; // "YYYY-MM"
  topServices: { id: ID; name: string; quantity: number; revenue: number }[];
  topPackages: { id: ID; name: string; reservations: number; revenue: number }[];
  upcomingCheckIns: { code: string; itemName: string; roomNumber: string; checkInDate: string; status: ReservationStatus; guestName: string; guests: number }[];
}
export type CellState = "libre" | "reservada" | "pendiente" | "bloqueada";
export interface AdminAvailabilityDTO {
  from: string;
  to: string; // exclusive
  days: string[];
  rooms: {
    id: ID;
    number: string;
    name: string;
    status: RoomStatus;
    cells: { date: string; state: CellState; reservationCode?: string; label?: string }[];
  }[];
}
export interface AuditLogDTO {
  id: ID;
  actorId: ID | null;
  actorEmail: string | null;
  action: string; // e.g. "room.update"
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  requestId: string | null;
  createdAt: string;
}
export interface NotificationDTO {
  id: ID;
  userId: ID | null;
  email: string;
  channel: "email";
  template: string;
  subject: string;
  status: "pendiente_proveedor" | "enviado" | "fallido";
  createdAt: string;
}
export interface UploadDTO {
  id: ID;
  url: string; // "/uploads/<file>"
  mime: string;
  size: number;
}
export interface HealthDTO {
  status: "ok" | "degraded" | "down";
  version: string;
  uptimeSec: number;
  db: "up" | "down";
  time: string;
  paymentProvider: string;
}
