# PAIE ROYALE — API REST v1

Base: `${VITE_API_URL}` (ej. `http://localhost:4000`). Todas las rutas cuelgan de `/api/v1`, salvo `/uploads/*` (archivos estáticos).
Tipos exactos (DTO): `src/lib/api/types.ts` (copia idéntica en `backend/src/types/dto.ts`).

## Convenciones
- JSON camelCase. Dinero: COP en pesos enteros (MySQL `DECIMAL(14,2)`). Fechas `YYYY-MM-DD` en America/Bogota; timestamps ISO UTC.
- Auth: `Authorization: Bearer <jwt>`. El JWT lleva `sub`, `role`, `tv` (token_version). Logout, bloqueo o cambio de contraseña incrementan `token_version` e invalidan los tokens anteriores.
- Cada respuesta incluye `X-Request-Id` (se respeta el que envíe el cliente si es un UUID/alfa-numérico ≤ 64).
- Errores: `{ "error": { "code", "message", "details"?: [{field,message}], "requestId" } }`.
  Códigos: `VALIDATION_ERROR` 400/422, `UNAUTHORIZED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT` 409 (solapamiento, duplicado), `RATE_LIMITED` 429, `PAYLOAD_TOO_LARGE` 413, `UNSUPPORTED_MEDIA_TYPE` 415, `INTERNAL` 500, `NOT_CONFIGURED` 503.
- Listados paginados: `?page=1&pageSize=20` (máx 100) → `{ data: [...], meta: { page, pageSize, total, totalPages } }`.
- Idempotencia: `POST /reservations` y `POST /payments` aceptan `Idempotency-Key` (8–64 chars). Misma clave + mismo usuario ⇒ se devuelve la respuesta original (mismo status y body) sin repetir la operación.
- Límites: JSON 200 kB; imágenes 5 MB (JPEG/PNG/WEBP, validación por firma binaria, nombre aleatorio).
- Rate limit: global 300 req/5 min por IP; `/auth/*` 20 req/15 min por IP; `/quotes` 60 req/min.

## Salud
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/health/live` | `{status:"ok"}` siempre que el proceso responda |
| GET | `/health/ready` | 200 `{status:"ok",db:"up"}` o 503 si MySQL no responde |
| GET | `/status` | `HealthDTO` |

## Autenticación (`/auth`)
| Método | Ruta | Auth | Body → Respuesta |
|---|---|---|---|
| POST | `/auth/register` | — | `RegisterInput` → 201 `AuthResponse` (rol SIEMPRE `cliente`; contraseña ≥ 8, con letra y número) |
| POST | `/auth/login` | — | `{email,password}` → `AuthResponse`; 401 credenciales; 403 `ACCOUNT_BLOCKED` |
| POST | `/auth/logout` | sí | → 204 (incrementa token_version) |
| GET | `/auth/me` | sí | → `{ user: UserDTO }` |
| PATCH | `/auth/me` | sí | `{name?,phone?,promoOptIn?}` → `{ user }` |
| POST | `/auth/change-password` | sí | `{currentPassword,newPassword}` → `AuthResponse` (nuevo token) |
| POST | `/auth/forgot-password` | — | `{email}` → 202 `{ok:true}` siempre (no revela si existe). Crea token aleatorio de un solo uso (se guarda solo su SHA-256), expira en 30 min, y registra notificación `password_reset` con estado `pendiente_proveedor`. Sin proveedor de correo, en `NODE_ENV=development` el enlace se escribe en el log del servidor. |
| POST | `/auth/reset-password` | — | `{token,password}` → 200 `{ok:true}`; 400 `INVALID_TOKEN` si expiró/usado |

## Catálogo público (`/catalog`) — sin login
| GET | Ruta | Respuesta |
|---|---|---|
| | `/catalog/rooms` | `RoomDTO[]` (excluye `inactiva`) |
| | `/catalog/rooms/:idOrSlug` | `RoomDTO` |
| | `/catalog/rooms/:id/availability?from&to` | `AvailabilityDTO` (rango máx 400 días) |
| | `/catalog/services` | `ServiceDTO[]` (excluye `inactivo`) |
| | `/catalog/packages` | `PackageDTO[]` (solo activos) |
| | `/catalog/packages/:idOrSlug` | `PackageDTO` |
| | `/catalog/promotions` | `PromotionDTO[]` vigentes y `activa` |
| | `/settings/public` | `PublicSettingsDTO` |

| POST | `/quotes` | — | `QuoteRequest` → `QuoteResponse` (mismas reglas que la reserva, sin escribir) |

## Reglas de negocio de reserva (validadas en servidor)
1. Fechas: llegada ≥ hoy (Bogotá); salida > llegada; noches ≤ `maxNightsOnline`.
2. Horas dentro de ventanas de `settings` (check-in 15:00–22:00, check-out 06:00–12:00 por defecto); si la llegada es hoy, la hora debe ser futura.
3. Huéspedes: adultos ≥ 1, niños ≥ 0, total ≤ capacidad (habitación) o `maxGuests` (paquete).
4. Noches: entre `minNights` y `maxNights` de la habitación; paquetes exigen exactamente `nights`. Cada `stay_rule` activa (de la habitación o global) cuyo rango toque alguna noche impone su min/max (gana la más estricta) y su `nightlyPrice` reemplaza el precio de esas noches.
5. Disponibilidad: rango semiabierto `[llegada, salida)`. Choca con reservas `pendiente_pago|confirmada|completada` y con `room_blocks`. La habitación debe estar `disponible`. Al crear se hace `SELECT … FROM rooms WHERE id=? FOR UPDATE` dentro de la transacción y se revalida (evita doble reserva concurrente).
6. Servicios: solo `activo`. Precio: `persona` × huéspedes, `noche` × noches, `estadia` × 1.
7. Promociones: automáticas si `code` es null; con código solo si el cliente lo envía. Deben estar `activa`, hoy ∈ [startsAt, endsAt] y `usesCount < maxUses`. Porcentaje 1–90 % o precio fijo (> 0 y < precio original). Se descuentan por línea (noche, paquete o servicio); el descuento nunca supera el importe de la línea. `usesCount` se incrementa al confirmar el pago.
8. Impuestos: `tax_rates` por concepto (`alojamiento`, `paquete`, `servicio`, `seguro`). IVA = round((importe − descuento) × tasa) por línea; nunca se aplica dos veces. Seguro hotelero = `insurancePerGuestNight` × huéspedes × noches, línea propia (tasa por defecto 0 %).
9. Reserva nueva: `pendiente_pago`. Pasa a `confirmada` con pago aprobado (simulado o transferencia verificada) o al elegir `en_hotel` (pago `pendiente`). Reservas `pendiente_pago` sin pago a las 24 h se pueden expirar (cancelar) con `npm run jobs:expire`.
10. Cancelación por el cliente (antes de la llegada): reembolso 100 % si faltan ≥ `fullRefundHours` (72 h), `partialRefundPercent` (50 %) si ≥ `partialRefundHours` (24 h), 0 % después. Se crea `refund` en estado `pendiente` sobre el pago aprobado; el admin lo procesa.

## Cliente (requiere login)
| Método | Ruta | Body/Query → Respuesta |
|---|---|---|
| POST | `/reservations` | `CreateReservationInput` (+`Idempotency-Key`) → 201 `ReservationDTO`; 409 `CONFLICT` si se solapa |
| GET | `/reservations/mine` | `?status&q&page&pageSize` → `Paginated<ReservationDTO>` |
| GET | `/reservations/:code` | dueño o admin → `ReservationDTO` |
| POST | `/reservations/:code/cancel` | `{reason}` → `CancelResult` |
| GET | `/reservations/:code/receipt.pdf` | dueño o admin → `application/pdf` (comprobante interno, “no es factura electrónica DIAN”) |
| POST | `/payments` | `CreatePaymentInput` (+`Idempotency-Key`) → 201 `{ payment: PaymentDTO, reservation: ReservationDTO }`. `simulado`: aprobado/rechazado inmediato, `isSimulation:true`, referencia `SIM-…`. `transferencia`: `pendiente` hasta subir comprobante. `en_hotel`: `pendiente`, reserva `confirmada`. |
| POST | `/payments/:id/proof` | multipart `file` (JPG/PNG/WEBP/PDF ≤ 5 MB) → `PaymentDTO` en `en_verificacion` |
| GET | `/favorites` | → `FavoriteDTO[]` |
| POST | `/favorites` | `{itemType,itemId}` → 201 `FavoriteDTO` (idempotente) |
| DELETE | `/favorites/:itemType/:itemId` | → 204 |

## Administración (`/admin`, rol `admin`) — todo cambio queda en `audit_logs`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/admin/dashboard?from&to` | `DashboardDTO` (por defecto últimos 30 días) |
| GET | `/admin/rooms?q&status&page&pageSize` | `Paginated<RoomDTO>` (incluye inactivas) |
| GET/POST | `/admin/rooms`, `/admin/rooms/:id` | `RoomInput` → `RoomDTO`; 409 si número/slug duplicado |
| PUT | `/admin/rooms/:id` | `RoomInput` → `RoomDTO` |
| PATCH | `/admin/rooms/:id/status` | `{status}` → `RoomDTO` |
| DELETE | `/admin/rooms/:id` | sin reservas: borra; con historial: pasa a `inactiva` (`{deleted:false, deactivated:true}`) |
| GET/POST | `/admin/rooms/:id/blocks` | `RoomBlockDTO[]` / `{startDate,endDate,reason}` → 201 (409 si choca con reservas) |
| DELETE | `/admin/room-blocks/:id` | 204 |
| GET/POST | `/admin/stay-rules` | `StayRuleDTO[]` / `StayRuleInput` |
| PUT/DELETE | `/admin/stay-rules/:id` | |
| GET | `/admin/amenities` | `AmenityDTO[]` |
| GET/POST | `/admin/services` (`?q&status&page`) | `Paginated<ServiceDTO>` / `ServiceInput` |
| PUT/DELETE | `/admin/services/:id` | con historial ⇒ `inactivo` |
| GET/POST | `/admin/packages` | `Paginated<PackageDTO>` / `PackageInput` |
| PUT/DELETE | `/admin/packages/:id` | con historial ⇒ `active=false` |
| GET/POST | `/admin/promotions` (`?status&targetType&page`) | `Paginated<PromotionDTO>` / `PromotionInput` (valida que el descuento no supere el precio y fechas) |
| PUT/DELETE | `/admin/promotions/:id` | |
| PATCH | `/admin/promotions/:id/status` | `{status}` (`activa`/`pausada`/`finalizada`) |
| POST | `/admin/uploads` | multipart `file` imagen → 201 `UploadDTO` |
| GET | `/admin/reservations?status&q&from&to&page&pageSize` | `Paginated<ReservationDTO>` |
| GET | `/admin/reservations/export?format=csv|xlsx&status&q&from&to` | archivo |
| PATCH | `/admin/reservations/:code/status` | `{status, reason?}` (`confirmada`,`completada`,`no_show`,`cancelada`) |
| POST | `/admin/reservations/:code/cancel` | `{reason, refundPercent}` → `CancelResult` |
| GET | `/admin/availability?from&to` | `AdminAvailabilityDTO` (máx 62 días) |
| GET | `/admin/payments?status&method&q&page` | `Paginated<PaymentDTO>` |
| GET | `/admin/payments/export?format=csv|xlsx` | archivo |
| POST | `/admin/payments/:id/verify` | `{approve:boolean, note?}` (transferencias `en_verificacion`/`pendiente`, y `en_hotel` al cobrar) |
| POST | `/admin/payments/:id/refunds` | `{amount, reason}` → 201 `RefundDTO` (≤ aprobado − reembolsado) |
| GET | `/admin/refunds?status&page` | `Paginated<RefundDTO>` |
| POST | `/admin/refunds/:id/process` | `{approve:boolean}` → `RefundDTO` (simulado: no mueve dinero real) |
| GET | `/admin/users?q&role&status&page` | `Paginated<UserDTO>` con `reservationsCount` |
| PATCH | `/admin/users/:id` | `{role?, active?}`. No se puede quitar el rol ni bloquear al último admin activo, ni a uno mismo. No hay borrado físico. |
| GET | `/admin/reports/sales?from&to` | `{ rows: {month, reservations, revenue, refunds, net}[] }` |
| GET | `/admin/reports/sales/export?format=csv|xlsx&from&to` | archivo |
| GET/PUT | `/admin/settings` | `SettingsDTO` |
| GET/PUT | `/admin/tax-rates` | `TaxRateDTO[]` (tasa 0–0.5) |
| GET | `/admin/audit?entity&action&actor&page` | `Paginated<AuditLogDTO>` |
| GET | `/admin/notifications?page` | `Paginated<NotificationDTO>` |

## Pagos reales (pendiente)
`backend/src/payments/providers.ts` define la interfaz `PaymentProvider`. Solo `simulador` está implementado. `wompi` devuelve `NOT_CONFIGURED` (503) hasta configurar `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET` y el webhook `POST /api/v1/webhooks/wompi` (no implementado: requiere validar la firma de eventos con el secreto real).
