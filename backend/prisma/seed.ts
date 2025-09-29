// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
// NOTE: Use the correct relative path to your generated client if the standard import fails.
// For example: import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // --- 1. Insert Decant Sizes ---
  console.log("Inserting decant sizes...");
  const size2ml = await prisma.decant_sizes.upsert({
    where: { size_ml: 2 },
    update: {},
    create: { size_ml: 2, label: "2ml Sample" },
  });
  const size5ml = await prisma.decant_sizes.upsert({
    where: { size_ml: 5 },
    update: {},
    create: { size_ml: 5, label: "5ml Travel" },
  });
  const size10ml = await prisma.decant_sizes.upsert({
    where: { size_ml: 10 },
    update: {},
    create: { size_ml: 10, label: "10ml Decant" },
  });
  console.log(
    `Sizes inserted: ${size2ml.label}, ${size5ml.label}, ${size10ml.label}`
  );

  // --- 2. Insert Brands ---
  console.log("Inserting brands...");
  const brandsData = [
    {
      name: "Tom Ford",
      description:
        "Luxury American fashion house known for sophisticated fragrances",
    },
    {
      name: "Creed",
      description:
        "Historic perfume house established in 1760, crafting artisanal fragrances",
    },
    {
      name: "Maison Francis Kurkdjian",
      description: "Contemporary French perfume house known for modern luxury",
    },
    {
      name: "Le Labo",
      description:
        "Artisanal perfume house focusing on fresh, handcrafted fragrances",
    },
    {
      name: "Byredo",
      description: "Swedish luxury brand known for modern, minimalist scents",
    },
  ];

  const brandsMap = new Map<string, bigint>();
  for (const data of brandsData) {
    const brand = await prisma.brands.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    brandsMap.set(brand.name, brand.id);
  }
  console.log(`Brands inserted: ${Array.from(brandsMap.keys()).join(", ")}`);

  // --- 3. Insert Fragrances ---
  console.log("Inserting fragrances...");
  const fragrancesData = [
    {
      brandName: "Tom Ford",
      name: "Oud Wood",
      description:
        "A rare, exotic and smoky blend featuring oud wood from the finest sources",
      scent_family: "Oriental Woody",
      top_notes: "Brazilian Rosewood, Chinese Pepper",
      middle_notes: "Oud Wood, Sandalwood",
      base_notes: "Vanilla, Amber",
    },
    {
      brandName: "Tom Ford",
      name: "Tobacco Vanille",
      description: "A sophisticated blend of sweet and spicy tobacco leaves",
      scent_family: "Oriental Spicy",
      top_notes: "Tobacco Leaf, Spicy Notes",
      middle_notes: "Vanilla, Cocoa",
      base_notes: "Dried Fruits, Woody Notes",
    },
    {
      brandName: "Creed",
      name: "Aventus",
      description:
        "A sophisticated scent perfect for the successful, ambitious and dynamic man",
      scent_family: "Chypre Fruity",
      top_notes: "Blackcurrant, Apple, Pineapple",
      middle_notes: "Patchouli, Moroccan Rose",
      base_notes: "Musk, Oak Moss, Ambergris",
    },
    {
      brandName: "Maison Francis Kurkdjian",
      name: "Baccarat Rouge 540",
      description: "A poetic alchemy between jasmine flowers and saffron spice",
      scent_family: "Amber Floral",
      top_notes: "Saffron, Jasmine",
      middle_notes: "Amberwood, Ambergris",
      base_notes: "Fir Resin, Cedar",
    },
    {
      brandName: "Le Labo",
      name: "Santal 33",
      description: "A smoky-rose scent that has become a cult classic",
      scent_family: "Woody Aromatic",
      top_notes: "Violet, Cardamom",
      middle_notes: "Iris, Ambrox",
      base_notes: "Sandalwood, Cedarwood",
    },
    {
      brandName: "Byredo",
      name: "Gypsy Water",
      description:
        "A fresh take on the classic eau de cologne with a bohemian spirit",
      scent_family: "Woody Aromatic",
      top_notes: "Bergamot, Pepper, Juniper",
      middle_notes: "Incense, Pine Needles",
      base_notes: "Vanilla, Sandalwood",
    },
  ];

  const fragranceMap = new Map<string, bigint>();
  for (const data of fragrancesData) {
    const brand_id = brandsMap.get(data.brandName);
    if (!brand_id) throw new Error(`Brand ID not found for ${data.brandName}`);

    const fragrance = await prisma.fragrances.create({
      data: {
        ...data,
        brand_id: brand_id,
        image_url: data.image_url || null,
      },
    });
    fragranceMap.set(fragrance.name, fragrance.id);
  }
  console.log(
    `Fragrances inserted: ${Array.from(fragranceMap.keys()).join(", ")}`
  );

  // --- 4. Insert Prices ---
  console.log("Inserting fragrance prices...");

  // Helper to find ID safely
  const getFId = (name: string) => fragranceMap.get(name) || 0n;
  const getSId = (size: number) => {
    if (size === 2) return size2ml.id;
    if (size === 5) return size5ml.id;
    if (size === 10) return size10ml.id;
    throw new Error(`Size ID not found for ${size}ml`);
  };

  const pricesToInsert = [
    // Tom Ford Oud Wood (id=1 in SQL)
    { fragranceName: "Oud Wood", size: 2, price: 12.0 },
    { fragranceName: "Oud Wood", size: 5, price: 28.0 },
    { fragranceName: "Oud Wood", size: 10, price: 55.0 },
    // Tom Ford Tobacco Vanille (id=2 in SQL)
    { fragranceName: "Tobacco Vanille", size: 2, price: 12.0 },
    { fragranceName: "Tobacco Vanille", size: 5, price: 28.0 },
    { fragranceName: "Tobacco Vanille", size: 10, price: 55.0 },
    // Creed Aventus (id=3 in SQL)
    { fragranceName: "Aventus", size: 2, price: 15.0 },
    { fragranceName: "Aventus", size: 5, price: 35.0 },
    { fragranceName: "Aventus", size: 10, price: 68.0 },
    // MFK Baccarat Rouge 540 (id=4 in SQL)
    { fragranceName: "Baccarat Rouge 540", size: 2, price: 18.0 },
    { fragranceName: "Baccarat Rouge 540", size: 5, price: 42.0 },
    { fragranceName: "Baccarat Rouge 540", size: 10, price: 82.0 },
    // Le Labo Santal 33 (id=5 in SQL)
    { fragranceName: "Santal 33", size: 2, price: 14.0 },
    { fragranceName: "Santal 33", size: 5, price: 32.0 },
    { fragranceName: "Santal 33", size: 10, price: 62.0 },
    // Byredo Gypsy Water (id=6 in SQL)
    { fragranceName: "Gypsy Water", size: 2, price: 13.0 },
    { fragranceName: "Gypsy Water", size: 5, price: 30.0 },
    { fragranceName: "Gypsy Water", size: 10, price: 58.0 },
  ];

  await prisma.fragrance_decant_prices.createMany({
    data: pricesToInsert.map((p) => ({
      fragrance_id: getFId(p.fragranceName),
      decant_size_id: getSId(p.size),
      price: p.price,
    })),
    skipDuplicates: true,
  });
  console.log("Fragrance prices inserted successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
