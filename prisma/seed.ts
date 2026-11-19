/**
 * Database seed — development data for Radha Krishna Panchha Dhatu.
 * Run: pnpm db:seed
 */

import { PrismaClient, UserRole, ProductStatus } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: "admin@radhakrishnapanchadhatu.com.np" },
    update: {},
    create: {
      name: "Store Owner",
      email: "admin@radhakrishnapanchadhatu.com.np",
      role: UserRole.OWNER,
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "panchadhatu" },
      update: {},
      create: {
        name: "Panchadhatu",
        slug: "panchadhatu",
        description: "Traditional five-metal alloy jewellery and ornaments",
        sortOrder: 1,
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "steel" },
      update: {},
      create: {
        name: "Steel Jewellery",
        slug: "steel",
        description: "High-quality steel jewellery and ornaments",
        sortOrder: 2,
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "earrings" },
      update: {},
      create: {
        name: "Earrings",
        slug: "earrings",
        sortOrder: 3,
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "necklaces" },
      update: {},
      create: {
        name: "Necklaces",
        slug: "necklaces",
        sortOrder: 4,
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "rings" },
      update: {},
      create: {
        name: "Rings",
        slug: "rings",
        sortOrder: 5,
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "bracelets" },
      update: {},
      create: {
        name: "Bracelets",
        slug: "bracelets",
        sortOrder: 6,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // ── Store settings ──────────────────────────────────────────────────────
  await db.storeSetting.upsert({
    where: { key: "store_name" },
    update: {},
    create: {
      key: "store_name",
      value: "Radha Krishna Panchha Dhatu",
      updatedBy: admin.id,
    },
  });

  await db.storeSetting.upsert({
    where: { key: "store_phone" },
    update: {},
    create: {
      key: "store_phone",
      value: "+977 984-670-3068",
      updatedBy: admin.id,
    },
  });

  await db.storeSetting.upsert({
    where: { key: "store_whatsapp" },
    update: {},
    create: {
      key: "store_whatsapp",
      value: "9779846703068",
      updatedBy: admin.id,
    },
  });

  await db.storeSetting.upsert({
    where: { key: "store_address" },
    update: {},
    create: {
      key: "store_address",
      value: {
        line1: "Yogikuti, Santichowk",
        line2: "Tilottama Path",
        city: "Butwal",
        district: "Rupandehi",
        province: "Lumbini Province",
        country: "Nepal",
      },
      updatedBy: admin.id,
    },
  });

  await db.storeSetting.upsert({
    where: { key: "currency" },
    update: {},
    create: { key: "currency", value: "NPR", updatedBy: admin.id },
  });

  await db.storeSetting.upsert({
    where: { key: "timezone" },
    update: {},
    create: { key: "timezone", value: "Asia/Kathmandu", updatedBy: admin.id },
  });

  console.log("✅ Store settings seeded");

  // ── Announcement bar ────────────────────────────────────────────────────
  await db.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      message:
        "Delivery throughout Nepal | Panchadhatu & Steel Jewellery | Call: 984-670-3068",
      isEnabled: true,
      isScrolling: true,
      sortOrder: 1,
    },
  });
  console.log("✅ Announcement bar seeded");

  // ── Sample product (unpublished) ────────────────────────────────────────
  const panchadhatu = categories.find((c) => c.slug === "panchadhatu")!;

  await db.product.upsert({
    where: { slug: "sample-panchadhatu-necklace" },
    update: {},
    create: {
      name: "Sample Panchadhatu Necklace",
      slug: "sample-panchadhatu-necklace",
      sku: "PKD-001",
      shortDescription: "A sample Panchadhatu necklace — replace with real product details",
      description: "Replace this with the actual product description.",
      material: "Panchadhatu",
      categoryId: panchadhatu.id,
      price: 350000, // NPR 3,500 in paisa
      stock: 10,
      lowStockThreshold: 3,
      status: ProductStatus.DRAFT,
      isFeatured: false,
      isNewArrival: false,
      tags: ["panchadhatu", "necklace"],
    },
  });
  console.log("✅ Sample product seeded (DRAFT)");

  console.log("\n✨ Seed complete.");
  console.log("→ Set the admin password via the admin panel or Auth.js.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
