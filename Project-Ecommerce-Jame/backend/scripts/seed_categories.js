const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Fashion', description: 'Clothing, footwear, and accessories' },
  { name: 'Books', description: 'Books, magazines, and literature' },
  { name: 'Home & Living', description: 'Furniture, decor, and home essentials' },
  { name: 'Beauty & Personal Care', description: 'Cosmetics, skincare, and grooming' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
  { name: 'Toys & Games', description: 'Toys, board games, and puzzles' },
  { name: 'Automotive', description: 'Car parts, accessories, and care' },
  { name: 'Health & Wellness', description: 'Health supplements and wellness products' },
  { name: 'Collectibles & Art', description: 'Antiques, art pieces, and collectibles' },
  { name: 'Pets', description: 'Pet food, accessories, and care' },
  { name: 'Food & Beverages', description: 'Snacks, drinks, and pantry items' },
  { name: 'Stationery', description: 'Office supplies and school materials' },
  { name: 'Others', description: 'Miscellaneous items' },
];

async function main() {
  console.log('Seeding categories...');
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    });
    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
