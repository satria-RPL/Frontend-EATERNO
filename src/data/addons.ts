export type Addon = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
};

export const categoryAddons: Record<string, Addon[]> = {
  coffee: [
    {
      id: "gula-pasir",
      name: "Gula Pasir",
      price: 0,
      category: "Pemanis",
      image: "/img/addons/gula-pasir.jpg",
    },
    {
      id: "gula-aren",
      name: "Gula Aren",
      price: 2000,
      category: "Pemanis",
      image: "/img/addons/gula-aren.jpg",
    },
    {
      id: "extra-shot",
      name: "Extra Shot",
      price: 5000,
      category: "Kopi",
      image: "/img/addons/extra-shot.jpg",
    },
    {
      id: "creamer",
      name: "Creamer",
      price: 2000,
      category: "Susu",
      image: "/img/addons/creamer.jpg",
    },
  ],
  tea: [
    {
      id: "gula",
      name: "Gula",
      price: 0,
      category: "Pemanis",
      image: "/img/addons/gula-pasir.jpg",
    },
    {
      id: "lemon",
      name: "Lemon",
      price: 2000,
      category: "Rasa",
      image: "/img/addons/lemon.jpg",
    },
    {
      id: "madu",
      name: "Madu",
      price: 3000,
      category: "Pemanis",
      image: "/img/addons/madu.jpg",
    },
  ],
  juice: [
    {
      id: "extra-ice",
      name: "Extra Ice",
      price: 0,
      category: "Preferensi",
      image: "/img/addons/ice.jpg",
    },
    {
      id: "topping-boba",
      name: "Topping Boba",
      price: 8000,
      category: "Topping",
      image: "/img/addons/boba.jpg",
    },
    {
      id: "syrup-vanilla",
      name: "Syrup (Vanilla)",
      price: 3000,
      category: "Rasa",
      image: "/img/addons/syrup.jpg",
    },
  ],
  rice: [
    {
      id: "sambal-biasa",
      name: "Sambal Biasa",
      price: 5000,
      category: "Sambal",
      image: "/img/addons/sambal-biasa.jpg",
    },
    {
      id: "telur-dadar",
      name: "Telur Dadar",
      price: 5000,
      category: "Lauk",
      image: "/img/addons/telur-dadar.jpg",
    },
    {
      id: "kerupuk",
      name: "Kerupuk",
      price: 2000,
      category: "Lauk",
      image: "/img/addons/kerupuk.jpg",
    },
  ],
  pasta: [
    {
      id: "extra-cheese",
      name: "Extra Cheese",
      price: 12000,
      category: "Topping",
      image: "/img/addons/cheese.jpg",
    },
    {
      id: "topping-bacon",
      name: "Bacon",
      price: 15000,
      category: "Topping",
      image: "/img/addons/bacon.jpg",
    },
  ],
  default: [
    { id: "napkin", name: "Napkin", price: 0 },
    { id: "extra-spoon", name: "Extra Spoon", price: 0 },
  ],
};

export const productAddons: Record<number, Addon[]> = {
  1: [
    {
      id: "extra-shot",
      name: "Extra Shot (Single)",
      price: 6000,
      category: "Kopi",
      image: "/img/addons/extra-shot.jpg",
    },
    {
      id: "syrup-hazelnut",
      name: "Syrup Hazelnut",
      price: 4000,
      category: "Rasa",
      image: "/img/addons/syrup-hazelnut.jpg",
    },
  ],
  4: [
    {
      id: "sambal-biasa",
      name: "Sambal Biasa",
      price: 0,
      category: "Sambal",
      image: "/img/addons/sambal-biasa.jpg",
    },
    {
      id: "sambal-extra-pedas",
      name: "Sambal Ekstra Pedas",
      price: 5000,
      category: "Sambal",
      image: "/img/addons/sambal-pedas.jpg",
    },
    {
      id: "telur-dadar",
      name: "Telur Dadar",
      price: 5000,
      category: "Lauk",
      image: "/img/addons/telur-dadar.jpg",
    },
  ],
  5: [
    {
      id: "extra-cheese",
      name: "Extra Cheese (Double)",
      price: 15000,
      category: "Topping",
      image: "/img/addons/cheese.jpg",
    },
  ],
};

export function getAddonsForProduct(
  productId: number,
  categoryId?: string
): Addon[] {
  const base =
    categoryId && categoryAddons[categoryId]
      ? categoryAddons[categoryId]
      : categoryAddons.default;
  const specific = productAddons[productId] ?? [];

  const map = new Map<string, Addon>();
  base.forEach((a) => map.set(a.id, a));
  specific.forEach((a) => map.set(a.id, a));
  return Array.from(map.values());
}
