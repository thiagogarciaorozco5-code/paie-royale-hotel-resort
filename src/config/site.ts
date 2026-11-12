// Configurable contact and social links. Values below are demo placeholders.
export const siteConfig = {
  name: "PAIE ROYALE",
  tagline: "Hotel & Resort",
  slogan: "Lujo, naturaleza y experiencias inolvidables",
  location: "Sierra Nevada · Caribe colombiano",
  whatsappNumber: "573000000000", // demo — replace with the real number (country code, no +)
  whatsappMessage: "Hola PAIE ROYALE, quisiera información sobre una reserva.",
  email: "reservas@paieroyale.co", // demo
  phone: "+57 300 000 0000", // demo
  socials: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  bank: {
    name: "Bancolombia (demo)",
    accountType: "Cuenta de ahorros",
    accountNumber: "000-000000-00",
    holder: "PAIE ROYALE S.A.S. (demo)",
    nit: "900.000.000-0",
  },
  // Integrations — flip to true only once real credentials are configured.
  integrations: {
    googleOAuth: false,
    email: false,
    cardGateway: false,
  },
} as const;

export function whatsappLink() {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}
