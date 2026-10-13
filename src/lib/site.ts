export const site = {
  title: "ASD Invictus Salerno — Sports Chanbara",
  description:
    "Sports Chanbara per adulti a Salerno. Scopri ASD Invictus: il team, gli allenamenti, le foto e i video. Lunedì, mercoledì e venerdì dalle 20 alle 22.",
  instagram: "https://www.instagram.com/asdinvictus_salerno/",
  email: "invictussalerno@libero.it",
  phone: "388 790 3344",
  phoneHref: "tel:+393887903344",
  whatsapp: "https://wa.me/393887903344",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Polisportiva%20Linus%2C%20Viale%20delle%20Querce%201%2C%20Salerno",
  mapEmbed:
    "https://maps.google.com/maps?q=Polisportiva%20Linus%2C%20Viale%20delle%20Querce%201%2C%20Salerno&z=16&output=embed",
} as const;

export function assetPath(filename: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/assets/${filename}`;
}

export const navigation = [
  { href: "#corso", label: "Il corso" },
  { href: "#team", label: "Il team" },
  { href: "#video", label: "Video" },
  { href: "#orari", label: "Orari" },
  { href: "#dove-siamo", label: "Dove siamo" },
] as const;
